"""ThermoSense AI - Main FastAPI Application Entrypoint.

Provides occupational heat-health monitoring, real-time physiological strain estimation,
environmental heat risk assessment, hydration balance calculations, and emergency escalation.
"""

import time
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.app.db.session import init_db, engine
from backend.app.api.v1 import api_v1_router
from backend.app.services.prediction_service import PredictionService
from backend.app.logging_config import RequestLoggingMiddleware, logger
from backend.app.middleware import (
    SecurityHeadersMiddleware,
    RateLimiterMiddleware,
    TimeoutMiddleware,
)

STARTUP_TIME = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global STARTUP_TIME
    STARTUP_TIME = time.time()
    # Initialize database tables on startup
    init_db()
    # Eagerly warm up model singleton
    try:
        PredictionService.get_predictor()
        logger.info("ThermoSense Predictor warmed up successfully.")
    except Exception as e:
        logger.warning(f"Predictor lazy warm-up notice: {e}")
    yield

app = FastAPI(
    title="ThermoSense AI — Occupational Heat-Health API",
    description=(
        "Hybrid multi-model AI engine for real-time occupational heat strain estimation (Model A), "
        "environmental work capacity loss (Model B), hydration monitoring (Model C), "
        "conformal uncertainty bounds (Model D), and safety alert escalation."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )

# 1. Custom Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (120 reqs / min / IP)
app.add_middleware(RateLimiterMiddleware, requests_limit=120, window_seconds=60)

# 3. Request Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# 4. Request Timeout Middleware (30s)
app.add_middleware(TimeoutMiddleware, timeout_seconds=30.0)

# 5. CORS Middleware for frontend / cross-origin dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Routes
app.include_router(api_v1_router)

@app.get("/", tags=["System"])
def read_root():
    return {
        "system": "ThermoSense AI",
        "role": "Occupational Heat-Health Monitoring and Early Warning",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
    }

@app.get("/health", tags=["System"])
def health_check(detailed: Optional[bool] = False):
    """
    Readiness and liveness health probe.
    Returns {"status": "healthy"} by default for strict backward compatibility.
    Pass ?detailed=true for deep operational metrics (DB, model load, uptime).
    """
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.error(f"Health check DB probe failed: {e}")

    predictor = PredictionService.get_predictor()
    model_a_ok = predictor.model_a is not None
    model_b_ok = predictor.model_b is not None
    
    uptime_sec = round(time.time() - STARTUP_TIME, 2)
    overall_status = "healthy" if (db_ok and model_a_ok and model_b_ok) else "degraded"

    if not detailed:
        return {"status": overall_status}

    return {
        "status": overall_status,
        "database": "connected" if db_ok else "unreachable",
        "model_a_loaded": model_a_ok,
        "model_b_loaded": model_b_ok,
        "model_c_ready": True,
        "model_d_conformal_ready": True,
        "uptime_seconds": uptime_sec,
    }
