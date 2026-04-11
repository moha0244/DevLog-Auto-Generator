from fastapi import APIRouter, HTTPException
from schemas.github import GitHubRequest, GitHubCommitsResponse
from services.github_service import GitHubService


router = APIRouter(prefix="/github", tags=["github"])


@router.post("/commits", response_model=GitHubCommitsResponse)
async def get_commits(request: GitHubRequest):
    """
    Récupère les commits GitHub pour un dépôt spécifié
    """
    print("🐍 Backend Controller - Réception de la requête")
    print(f"📋 Requête reçue: {request}")
    print(f"📂 Dépôt: {request.repo_name}")
    print(f"📅 Jours: {request.days}")
    print(f"👤 Auteur: {request.author}")
    print(f"🔑 Token présent: {'Oui' if request.token else 'Non'}")
    
    try:
        result = GitHubService.get_github_commits(
            repo_name=request.repo_name,
            token=request.token,
            days=request.days,
            author=request.author
        )
        
        print(f"✅ Résultat du service: {result.summary.totalCommits} commits trouvés")
        
        if result.error:
            print(f"❌ Erreur retournée par le service: {result.error}")
            raise HTTPException(status_code=400, detail=result.error)
            
        print("🎤 Envoi de la réponse au frontend")
        return result
    
    except Exception as e:
        print(f"💥 Erreur dans le contrôleur: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
