from github import Github
from datetime import datetime, timedelta, timezone
from collections import Counter
import os
from typing import Optional

from schemas.github import GitHubCommitsResponse
from utils.file_extensions import EXT_MAPPING


class GitHubService:
    @staticmethod
    def get_github_commits(
        repo_name: str, 
        token: Optional[str] = None, 
        days: int = 7, 
        author: Optional[str] = None
    ) -> GitHubCommitsResponse:
        print("🔧 GitHub Service - Début du traitement")
        print(f"📂 Dépôt cible: {repo_name}")
        print(f"📅 Période: {days} jours")
        print(f"👤 Filtre auteur: {author}")
        print(f"🔑 Token GitHub: {'Présent' if token else 'Absent'}")
        
        g = Github(token) if token else Github()

        try:
            print("🔗 Connexion à l'API GitHub...")
            repo = g.get_repo(repo_name)
            print(f"✅ Dépôt trouvé: {repo.full_name}")
            
            since = datetime.now(timezone.utc) - timedelta(days=days)
            print(f"📅 Date de début: {since}")

            commits = repo.get_commits(since=since)
            print("🔍 Récupération des commits...")

            results = []
            all_languages = []
            commit_count = 0

            for c in commits:
                commit_count += 1
                author_login = c.author.login if c.author else None
                author_name = c.commit.author.name if c.commit and c.commit.author else "Unknown"

                if author:
                    if author_login:
                        if author.lower() != author_login.lower():
                            continue
                    else:
                        if author.lower() != author_name.lower():
                            continue

                files = list(c.files) if c.files is not None else []

                exts = {
                    os.path.splitext(f.filename)[1].lower()
                    for f in files
                    if f.filename
                }

                languages = sorted({
                    EXT_MAPPING.get(ext, "Other")
                    for ext in exts
                    if ext
                })

                all_languages.extend(languages)

                commit_date = c.commit.author.date if c.commit and c.commit.author else None

                results.append({
                    "id": c.sha[:7],
                    "sha": c.sha[:7],
                    "fullSha": c.sha,
                    "message": c.commit.message.split("\n")[0],
                    "date": commit_date.isoformat() if commit_date else None,
                    "displayDate": commit_date.strftime("%b %d at %I:%M %p") if commit_date else "Unknown date",
                    "author": author_login or author_name,
                    "url": c.html_url,
                    "filesChanged": len(files),
                    "languages": languages,
                    "selected": True,
                })

            stats = Counter(all_languages)

            print(f"📊 Traitement terminé:")
            print(f"   📝 Commits analysés: {commit_count}")
            print(f"   ✅ Commits retenus: {len(results)}")
            print(f"   🔧 Langages détectés: {dict(stats)}")

            return GitHubCommitsResponse(
                summary={
                    "totalCommits": len(results),
                    "languageBreakdown": [
                        {"name": name, "count": count}
                        for name, count in stats.items()
                    ]
                },
                commits=results
            )

        except Exception as e:
            print(f"❌ Erreur dans le service GitHub: {str(e)}")
            print(f"💥 Type d'erreur: {type(e).__name__}")
            
            error_msg = str(e)
            if "rate limit" in error_msg.lower() or "403" in error_msg:
                if not token:
                    error_msg = "Limite de débit GitHub dépassée. Les requêtes sans token sont limitées à 60 par heure. Veuillez fournir un token GitHub."
                else:
                    error_msg = "Limite de débit GitHub dépassée. Veuillez réessayer plus tard."
            
            return GitHubCommitsResponse(
                summary={
                    "totalCommits": 0,
                    "languageBreakdown": []
                },
                commits=[],
                error=error_msg
            )
