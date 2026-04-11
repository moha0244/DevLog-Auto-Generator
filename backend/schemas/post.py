from pydantic import BaseModel
from typing import List, Optional, Dict

class PostGenerationRequest(BaseModel):
    commits: List[dict]  # La liste des commits cochés dans l'interface
    tone: str           # "Professional", "Casual", etc.
    platform: str       # "LinkedIn" par défaut
    language: str = "French"
    github_info: Optional[Dict] = None  # Informations du GitHub Form (username, repo, range, author)
