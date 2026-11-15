"""Telemetry evaluation router for ThermoSense AI."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.schemas.telemetry import TelemetryInput, TelemetryEvaluationResponse
from backend.app.services.prediction_service import PredictionService
from backend.app.db.session import get_db

router = APIRouter(prefix="/telemetry", tags=["Telemetry & Physiological Heat-Strain"])

@router.post("/evaluate", response_model=TelemetryEvaluationResponse)
def evaluate_telemetry(payload: TelemetryInput, db: Session = Depends(get_db)):
    """Evaluates real-time wearable sensor telemetry against Model A, Model D, and Safety Rules."""
    return PredictionService.evaluate_telemetry(payload, db=db)
