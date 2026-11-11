import time
from typing import Dict, Tuple
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import get_settings
from app.utils.logger import logger

settings = get_settings()


class RateLimitAndTelemetryMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter & structured request telemetry middleware."""

    def __init__(self, app):
        super().__init__(app)
        self._buckets: Dict[str, Tuple[int, float]] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        count, window_start = self._buckets.get(client_ip, (0, now))
        if now - window_start > 60.0:
            count, window_start = 1, now
        else:
            count += 1

        self._buckets[client_ip] = (count, window_start)

        if count > settings.rate_limit_per_minute:
            logger.warning("RATE_LIMIT_EXCEEDED", client_ip=client_ip, path=request.url.path)
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "Rate limit exceeded. Please wait before sending more requests.",
                },
            )

        try:
            response = await call_next(request)
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "HTTP_REQUEST",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=elapsed_ms,
            )
            return response
        except Exception as exc:
            logger.error("UNHANDLED_EXCEPTION", path=request.url.path, error=str(exc))
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": str(exc),
                },
            )
