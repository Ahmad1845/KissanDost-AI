from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-based configuration for KissanDost AI FastAPI Microservice."""

    app_name: str = "KissanDost AI Microservice"
    app_version: str = "3.0.0"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database & Redis
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kissandost"
    redis_url: str = "redis://localhost:6379/0"

    # Security & JWT
    jwt_secret_key: str = "kissandost-kp-super-secret-jwt-key-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Google Gemini AI & Multimodal Models
    gemini_api_key: str = ""
    gemini_vision_model: str = "gemini-3.8-flash"
    gemini_tts_model: str = "gemini-3.8-flash-tts"
    gemini_embedding_model: str = " sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    gemini_timeout_seconds: float = 5.5

    # Rate Limiting & Caching
    rate_limit_per_minute: int = 120
    weather_cache_ttl_seconds: int = 300

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
