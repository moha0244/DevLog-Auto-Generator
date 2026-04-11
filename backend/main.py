from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.github_controller import router as github_router
from services.ai_service import generate_linkedin_post
from schemas.post import PostGenerationRequest
import uvicorn
import logging
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DevLog Auto-Generator API",
    description="API pour générer des logs de développement à partir des commits GitHub",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes du frontend Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL par défaut de Angular CLI
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(github_router)

@app.get("/")
async def root():
    return {"message": "DevLog Auto-Generator API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/generate")
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

# Point d'entrée pour lancer le serveur
if __name__ == "__main__":
    

    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
