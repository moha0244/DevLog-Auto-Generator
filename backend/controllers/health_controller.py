from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/")
async def root():
    return {"message": "DevLog Auto-Generator API is running"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
