"""Hydration Status and Fluid Balance Router (Model C)."""

from fastapi import APIRouter
from backend.app.schemas.hydration import HydrationCheckRequest, HydrationResponse
from backend.app.services.prediction_service import PredictionService

router = APIRouter(prefix="/hydration", tags=["Hydration Balance & Fluid Replacement"])

@router.post("/calculate", response_model=HydrationResponse)
def calculate_hydration(payload: HydrationCheckRequest):
    """Calculates body mass loss %, hourly water loss rate, and required electrolyte fluid replacement."""
    return PredictionService.calculate_hydration(payload)
