"""Pydantic schemas for Worker profiles."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class WorkerCreate(BaseModel):
    external_id: str = Field(..., description="Unique worker badge or identifier e.g. W-104")
    full_name: str = Field(..., description="Worker display name")
    age_yrs: int = Field(32, ge=18, le=75)
    sex: str = Field("M", pattern="^(M|F)$")
    body_mass_kg: float = Field(75.0, ge=35.0, le=200.0)
    height_cm: float = Field(175.0, ge=120.0, le=230.0)
    body_fat_pct: Optional[float] = Field(None, ge=3.0, le=50.0)
    vo2peak_ml_kg_min: Optional[float] = Field(None, ge=15.0, le=85.0)
    acclimation_status: int = Field(1, ge=0, le=2)

class WorkerResponse(BaseModel):
    id: str
    external_id: str
    full_name: str
    age_yrs: int
    sex: str
    body_mass_kg: float
    height_cm: float
    bmi: Optional[float]
    acclimation_status: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
