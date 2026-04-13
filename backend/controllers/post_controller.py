from fastapi import APIRouter
from services.ai_service import generate_linkedin_post
from schemas.post import PostGenerationRequest
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["posts"])

@router.post("/generate")
async def generate_post(req: PostGenerationRequest):
    """
    Endpoint pour générer un post LinkedIn à partir des commits sélectionnés.
    """
    try:
        logger.info(f"Requête de génération reçue: {len(req.commits)} commits, ton: {req.tone}, plateforme: {req.platform}")
        
        result = generate_linkedin_post(
            commits=req.commits, 
            tone=req.tone, 
            platform=req.platform,
            github_info=req.github_info
        )
        
        logger.info("Post généré avec succès")
        
        # Gérer les deux formats de retour (string ou dict)
        if isinstance(result, dict):
            return {
                "generated_content": result.get("content"),
                "author_headline": result.get("author_headline")
            }
        else:
            # Ancien format (string) pour compatibilité
            return {"generated_content": result}
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du post: {str(e)}")
        return {"error": f"Erreur lors de la génération: {str(e)}"}
