"""Request timeout middleware."""

import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class TimeoutMiddleware(BaseHTTPMiddleware):
    """Cancels requests running longer than timeout_seconds and returns 504 Gateway Timeout."""
    def __init__(self, app, timeout_seconds: float = 30.0):
        super().__init__(app)
        self.timeout_seconds = timeout_seconds

    async def dispatch(self, request: Request, call_next):
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            return JSONResponse(
                status_code=504,
                content={"detail": "Request processing timed out (Gateway Timeout)."}
            )
