"""Pydantic schemas for Environmental Heat-Risk (Model B & Mode B fallback)."""

from typing import Optional
from pydantic import BaseModel, Field

class EnvironmentalRiskRequest(BaseModel):
    """Payload to evaluate environmental heat strain and physical work capacity loss."""
    air_temp_C: float = Field(..., ge=-10.0, le=65.0, description="Ambient air dry-bulb temperature (°C)")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity (%)")
    wind_speed_m_s: Optional[float] = Field(0.2, ge=0.0, le=30.0, description="Wind speed (m/s)")
    solar_radiation_W_m2: Optional[float] = Field(0.0, ge=0.0, le=1400.0, description="Solar irradiance (W/m²)")
    clothing_clo: Optional[float] = Field(1.0, ge=0.1, le=3.0, description="Clothing insulation value in clo")
    work_duration_min: Optional[float] = Field(60.0, ge=5.0, le=480.0, description="Exposure duration in minutes")

    # Worker characteristics (optional)
    age_yrs: Optional[float] = Field(32.0, ge=18.0, le=75.0)
    body_mass_kg: Optional[float] = Field(75.0, ge=35.0, le=200.0)
    vo2peak_ml_kg_min: Optional[float] = Field(None, ge=15.0, le=85.0)
    acclimated: Optional[bool] = Field(True)

class PWCLossIntervalResponse(BaseModel):
    point_estimate_pct: float
    lower_bound_pct: float
    upper_bound_pct: float
    confidence_level: float
    half_width_pct: float

class EnvironmentalRiskResponse(BaseModel):
    """Evaluation response for occupational thermal stress and work capacity loss."""
    pwc_loss: PWCLossIntervalResponse
    environmental_risk_level: str
    recommended_work_rest_ratio: str
    heat_index_C: Optional[float] = None
    wbgt_estimated_C: Optional[float] = None
    data_provenance: str = "estimated"
