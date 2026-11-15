"""Structured JSON and standard logging configuration for ThermoSense AI."""

import logging
import json
import time
from typing import Any, Dict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("thermosense")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs incoming request method, path, status, and duration in ms."""
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        
        try:
            response: Response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                f"{request.method} {request.url.path} - {response.status_code} ({duration_ms}ms) [client={client_ip}]"
            )
            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                f"UNHANDLED ERROR: {request.method} {request.url.path} ({duration_ms}ms) [client={client_ip}]: {str(exc)}"
            )
            raise exc
