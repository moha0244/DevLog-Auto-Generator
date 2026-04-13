from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.github_controller import router as github_router
from controllers.post_controller import router as post_router
from controllers.health_controller import router as health_router
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
    allow_origins=["*"],  # Accepter toutes les origines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(github_router)
app.include_router(post_router)
app.include_router(health_router)



# Point d'entrée pour lancer le serveur
if __name__ == "__main__":
    

    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
