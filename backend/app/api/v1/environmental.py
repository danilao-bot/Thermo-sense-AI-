"""Environmental Heat-Risk Router (Model B & Mode B fallback)."""

from fastapi import APIRouter
from backend.app.schemas.environmental import EnvironmentalRiskRequest, EnvironmentalRiskResponse
from backend.app.services.prediction_service import PredictionService

router = APIRouter(prefix="/environmental", tags=["Environmental Heat-Risk & Work Capacity Loss"])

@router.post("/evaluate", response_model=EnvironmentalRiskResponse)
def evaluate_environmental(payload: EnvironmentalRiskRequest):
    """Predicts Physical Work Capacity loss % and recommended work/rest cycle from environmental weather."""
    return PredictionService.evaluate_environmental(payload)
