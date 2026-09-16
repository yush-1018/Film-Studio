from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import health_router
from app.api.v1.workflows import workflows_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup initialization
    print(f"[Film Studio Agents] Initializing {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    yield
    # Teardown logic
    print("[Film Studio Agents] Gracefully shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Multi-Agent Cinematic Narrative & Multi-Modal Synthesis Engine",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix="/api")
app.include_router(workflows_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
