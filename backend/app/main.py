from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import get_settings
from app.middleware.rate_limit_and_logging import RateLimitAndTelemetryMiddleware
from app.api.routes import router as v1_router

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Production AI & Agronomic Decision Microservice for Khyber Pakhtunkhwa Farmers. "
            "Features a 10-Stage Computer Vision, RAG, Weather, and Deterministic Decision Engine Pipeline."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitAndTelemetryMiddleware)

    app.include_router(v1_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
