"""In-memory sliding window rate limiter middleware."""

import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory rate limiter per client IP.
    Default: 120 requests per 60-second window.
    """
    def __init__(self, app, requests_limit: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_records = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Exclude docs, schema, and health checks from aggressive rate limits
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - self.window_seconds

        # Clean timestamps older than sliding window
        timestamps = [t for t in self.client_records[client_ip] if t > window_start]
        self.client_records[client_ip] = timestamps

        if len(timestamps) >= self.requests_limit:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Too many requests.",
                    "limit": self.requests_limit,
                    "window_seconds": self.window_seconds
                },
                headers={"Retry-After": str(self.window_seconds)}
            )

        self.client_records[client_ip].append(now)
        return await call_next(request)
