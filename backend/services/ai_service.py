import requests
import os
import logging
import json
from utils.file_extensions import EXT_MAPPING

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_linkedin_post(commits, tone, platform="LinkedIn", github_info=None):
    """
    Génère un post pour la plateforme choisie à partir des commits sélectionnés en utilisant Mistral API.
    
    Args:
        commits: Liste des commits sélectionnés
        tone: Ton du post ("Professional", "Casual", etc.)
        platform: Plateforme cible ("LinkedIn" ou "X")
        github_info: Informations du GitHub Form (username, repo, range, author)
    
    Returns:
        str: Le contenu généré du post
    """
    try:
        # Configuration de l'API Mistral
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            logger.error("MISTRAL_API_KEY non trouvée dans les variables d'environnement")
            return "Erreur: Clé API Mistral non configurée"
        
        base_url = "https://api.mistral.ai/v1"
        
        # Préparation de la liste des commits pour le prompt
        commit_messages = []
        for commit in commits:
            message = commit.get('message', 'Commit sans message')
            # Extraire les langages depuis les fichiers modifiés si disponibles
            files = commit.get('files', [])
            languages = []
            for file in files:
                if '.' in file:
                    ext = '.' + file.split('.')[-1]
                    lang = EXT_MAPPING.get(ext, ext.upper().replace('.', ''))
                    if lang not in languages:
                        languages.append(lang)
            
            languages_str = ', '.join(languages) if languages else 'Code'
            commit_messages.append(f"- {message} ({languages_str})")
        
        commits_text = "\n".join(commit_messages)
        
        # Préparer les informations GitHub pour le contexte
        github_context = ""
        if github_info:
            username = github_info.get('username', 'utilisateur')
            repo = github_info.get('repo', 'projet')
            range_period = github_info.get('range', 'période récente')
            author = github_info.get('author', '')
            
            github_context = f"""
Contexte du projet :
- Utilisateur : {username}
- Repository : {repo}
- Période : {range_period}
{"- Auteur : " + author if author else ""}
"""
        
        # Construction du prompt détaillé
        prompt = f"""
Tu es un expert en personal branding pour développeurs sur {platform}.
Génère un post captivant à partir des commits suivants :

{github_context}

Commits réalisés :
{commits_text}

Directives strictes :
1. Langue : Français
2. Ton : {tone}
3. Plateforme : {platform}
4. Structure : 
   - Une accroche percutante avec un emoji pertinent.
   - Une section "Ce que j'ai accompli" (points listés avec des checkmarks verts).
   - Une section "Impact/Résultat" (expliquer pourquoi c'est important).
   - Une question pour engager la communauté à la fin.
   - 3 à 5 hashtags pertinents.
5. Style : Professionnel, aéré, évite le jargon trop complexe, privilégie l'impact métier.
6. Longueur : Maximum {"3000" if platform == "LinkedIn" else "280"} caractères pour {platform}.

Format de sortie : Texte brut prêt à être copié, sans balises markdown.
"""
        
        github_info_str = f", repo: {github_info.get('repo', 'N/A')}" if github_info else ""
        logger.info(f"Génération de post avec {len(commits)} commits, ton: {tone}, plateforme: {platform}{github_info_str}")
        
        # Préparation de la requête HTTP
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistral-large-latest",
            "messages": [
                {"role": "system", "content": f"Tu es un expert en création de contenu {platform} pour développeurs."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        # Appel à l'API Mistral via HTTP
        response = requests.post(f"{base_url}/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        
        response_data = response.json()
        generated_content = response_data["choices"][0]["message"]["content"]
        
        logger.info("Post généré avec succès")
        logger.info(f"Contenu généré: {generated_content}")
        
        # Extraire le headline de l'auteur depuis le contenu généré si disponible
        author_headline = extract_author_headline(generated_content, github_info)
        
        return {
            "content": generated_content,
            "author_headline": author_headline
        }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Erreur HTTP lors de la génération du post: {str(e)}")
        return f"Erreur HTTP lors de la génération: {str(e)}"
    except Exception as e:
        logger.error(f"Erreur lors de la génération du post: {str(e)}")
        return f"Erreur lors de la génération: {str(e)}"

def extract_author_headline(content: str, github_info: dict = None) -> str:
    """
    Génère un headline LinkedIn intelligent basé sur les commits et infos GitHub.
    """
    try:
        # Préparer le contexte pour Mistral
        author_name = github_info.get('author', 'Développeur') if github_info else 'Développeur'
        repo_name = github_info.get('repo', 'projet') if github_info else 'projet'
        
        # Extraire les technologies depuis les commits si possible
        tech_keywords = []
        if content:
            # Chercher des mots-clés techniques courants
            tech_patterns = ['React', 'Angular', 'Vue', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 
                           'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'GraphQL', 'REST API']
            for tech in tech_patterns:
                if tech.lower() in content.lower():
                    tech_keywords.append(tech)
        
        # Créer un prompt pour Mistral
        prompt = f"""
        Génère un headline LinkedIn professionnel et concis pour {author_name} basé sur ces informations:
        - Repository: {repo_name}
        - Technologies: {', '.join(tech_keywords) if tech_keywords else 'Développement web'}
        - Contenu du post: {content[:200]}...

        Le headline doit:
        1. Être court (max 60 caractères)
        2. Mentionner le rôle principal
        3. Inclure 1-2 technologies clés
        4. Être en français
        
        Exemples:
        - "Développeur Full Stack · React · Node.js"
        - "Software Engineer · Python · Machine Learning"
        - "Développeur Frontend · Angular · TypeScript"
        
        Retourne uniquement le headline, sans autre texte.
        """
        
        # Appeler Mistral pour générer le headline
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            return f"{author_name} · Software Engineer"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistral-small-latest",  # Modèle plus léger pour les headlines
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 50,
            "temperature": 0.7
        }
        
        response = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            headline = result["choices"][0]["message"]["content"].strip()
            # Nettoyer le headline
            headline = headline.replace('"', '').replace("'", "")
            return headline
        else:
            # Fallback si Mistral échoue
            return f"{author_name} · Software Engineer"
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération du headline: {str(e)}")
        # Fallback simple
        author_name = github_info.get('author', 'Développeur') if github_info else 'Développeur'
        return f"{author_name} · Software Engineer"
