"""Pydantic schemas for Work Sessions / Shifts."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SessionStart(BaseModel):
    worker_id: str = Field(..., description="Worker UUID or external badge ID")
    clothing_type: str = Field("heavy_ppe", description="permeable | heavy_ppe | impermeable | light")
    clothing_clo: float = Field(1.2, ge=0.1, le=3.0)
    workload_intensity: str = Field("moderate", description="light | moderate | heavy")
    location_name: Optional[str] = Field("Site Alpha")
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SessionEnd(BaseModel):
    pre_mass_kg: Optional[float] = None
    post_mass_kg: Optional[float] = None

class SessionResponse(BaseModel):
    id: str
    worker_id: str
    start_time: datetime
    end_time: Optional[datetime]
    clothing_type: str
    clothing_clo: float
    workload_intensity: str
    location_name: Optional[str]
    status: str

    model_config = ConfigDict(from_attributes=True)
