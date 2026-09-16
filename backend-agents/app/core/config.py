from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Film Studio Agent Engine"
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    REDIS_URL: str = "redis://localhost:6379/0"

    # Default Provider Configurations
    DEFAULT_LLM_PROVIDER: str = "mock"
    DEFAULT_STT_PROVIDER: str = "mock"
    DEFAULT_TTS_PROVIDER: str = "mock"
    DEFAULT_IMAGE_PROVIDER: str = "mock"
    DEFAULT_VIDEO_PROVIDER: str = "mock"

    # API Keys for Production Providers (Optional in Mock mode)
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    RUNWAY_API_KEY: str = ""
    STABILITY_API_KEY: str = ""

    # S3 Storage Configuration
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "film-studio-assets"
    S3_REGION: str = "us-east-1"
    USE_SSL: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
