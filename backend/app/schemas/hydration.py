"""Pydantic schemas for Hydration status & fluid loss evaluation (Model C)."""

from typing import Optional
from pydantic import BaseModel, Field

class HydrationCheckRequest(BaseModel):
    """Payload to evaluate pre/post shift body mass and dehydration risk."""
    pre_mass_kg: float = Field(..., gt=30.0, le=250.0, description="Nude or light-garment pre-shift mass (kg)")
    post_mass_kg: float = Field(..., gt=30.0, le=250.0, description="Post-shift mass (kg)")
    work_duration_min: float = Field(60.0, gt=0.0, le=720.0, description="Exposure duration in minutes")
    session_id: Optional[str] = Field(None, description="Optional associated session ID")

class HydrationResponse(BaseModel):
    """Response containing fluid deficit, loss rate, and rehydration protocol."""
    body_mass_loss_pct: float
    fluid_loss_liters: float
    loss_rate_L_hr: float
    hydration_status: str
    recommended_hydration: str
    data_provenance: str = "derived"
