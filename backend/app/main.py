"""ThermoSense AI - Main FastAPI Application Entrypoint.

Provides occupational heat-health monitoring, real-time physiological strain estimation,
environmental heat risk assessment, hydration balance calculations, and emergency escalation.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.session import init_db
from backend.app.api.v1 import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
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

# CORS middleware for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
def health_check():
    return {"status": "healthy"}
