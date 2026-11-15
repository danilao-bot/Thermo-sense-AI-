"""Live Weather Synchronization Router (Open-Meteo)."""

from fastapi import APIRouter, Query
from backend.app.services.weather_service import OpenMeteoWeatherService

router = APIRouter(prefix="/weather", tags=["Live Meteorological Context"])
weather_service = OpenMeteoWeatherService()

@router.get("/current")
async def get_current_weather(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Worker site latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Worker site longitude"),
):
    """Fetches real-time ambient temperature, humidity, wind, solar radiation, and estimated WBGT."""
    return await weather_service.get_current_weather(latitude=latitude, longitude=longitude)
