from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

health_router = APIRouter(tags=["Health"])


@health_router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "film-studio-backend-agents",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@health_router.get("/ready")
async def readiness_check():
    return {
        "status": "ready",
        "redis_target": settings.REDIS_URL,
        "default_providers": {
            "llm": settings.DEFAULT_LLM_PROVIDER,
            "stt": settings.DEFAULT_STT_PROVIDER,
            "tts": settings.DEFAULT_TTS_PROVIDER,
            "image": settings.DEFAULT_IMAGE_PROVIDER,
            "video": settings.DEFAULT_VIDEO_PROVIDER,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
