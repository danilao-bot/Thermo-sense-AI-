"""Pydantic schemas for Telemetry ingestion and evaluation."""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TelemetryInput(BaseModel):
    """Input payload for a real-time telemetry observation."""
    worker_id: Optional[str] = Field(None, description="Worker external or UUID key")
    session_id: Optional[str] = Field(None, description="Active shift session identifier")
    work_duration_min: float = Field(0.0, ge=0.0, description="Elapsed minutes in current work shift")

    # Wearable Telemetry
    heart_rate_bpm: Optional[float] = Field(None, ge=30.0, le=240.0, description="Real-time heart rate")
    skin_temp_mean_C: Optional[float] = Field(None, ge=20.0, le=45.0, description="Mean skin temperature")
    skin_temp_chest_C: Optional[float] = Field(None, ge=20.0, le=45.0)
    breathing_rate_bpm: Optional[float] = Field(None, ge=4.0, le=70.0)
    spo2_pct: Optional[float] = Field(None, ge=50.0, le=100.0)
    steps_per_min: Optional[float] = Field(None, ge=0.0)
    hrv_rmssd_ms: Optional[float] = Field(None, ge=0.0, le=500.0)

    # Rolling window context (optional, computed automatically if omitted)
    heart_rate_bpm_rolling_mean_15m: Optional[float] = None
    heart_rate_bpm_rolling_max_15m: Optional[float] = None
    skin_temp_mean_C_rolling_mean_15m: Optional[float] = None

    # Environmental Context
    air_temp_C: Optional[float] = Field(None, description="Ambient air temperature in °C")
    relative_humidity_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    wind_speed_m_s: Optional[float] = Field(0.2, ge=0.0)
    solar_radiation_W_m2: Optional[float] = Field(0.0, ge=0.0)
    clothing_clo: Optional[float] = Field(1.0, ge=0.1, le=3.0)

    # Individual Modifiers
    age_yrs: Optional[float] = Field(32.0, ge=18.0, le=75.0)
    sex: Optional[float] = Field(1.0, description="1.0=M, 0.0=F")
    body_mass_kg: Optional[float] = Field(75.0, ge=35.0, le=200.0)

class ConformalIntervalResponse(BaseModel):
    point_estimate_C: float
    lower_bound_C: float
    upper_bound_C: float
    confidence_level: float
    half_width_C: float
    sensor_quality_score: float
    confidence_tier: str

class StrainDetailsResponse(BaseModel):
    strain_code: str
    strain_label: str
    description: str
    work_rest_recommendation: str
    recommended_action: str

class AlertBannerItem(BaseModel):
    severity: str
    title: str
    message: str

class TelemetryEvaluationResponse(BaseModel):
    """Unified AI inference response returned to dashboards or wearable devices."""
    core_temp: ConformalIntervalResponse
    safety_status: str
    emergency_escalation: bool
    heat_strain_details: StrainDetailsResponse
    heat_stroke_details: Dict[str, Any]
    heat_syncope_details: Dict[str, Any]
    active_alerts: List[AlertBannerItem]
    data_provenance: str = "estimated"
