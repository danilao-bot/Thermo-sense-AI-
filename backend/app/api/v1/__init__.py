"""API v1 routers aggregator."""

from fastapi import APIRouter
from backend.app.api.v1.telemetry import router as telemetry_router
from backend.app.api.v1.environmental import router as environmental_router
from backend.app.api.v1.hydration import router as hydration_router
from backend.app.api.v1.weather import router as weather_router
from backend.app.api.v1.workers import router as workers_router
from backend.app.api.v1.sessions import router as sessions_router
from backend.app.api.v1.alerts import router as alerts_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(telemetry_router)
api_v1_router.include_router(environmental_router)
api_v1_router.include_router(hydration_router)
api_v1_router.include_router(weather_router)
api_v1_router.include_router(workers_router)
api_v1_router.include_router(sessions_router)
api_v1_router.include_router(alerts_router)

__all__ = ["api_v1_router"]
