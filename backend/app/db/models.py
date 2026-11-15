"""SQLAlchemy Database Models for ThermoSense AI."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.app.db.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def now_utc_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class WorkerModel(Base):
    """Registered industrial or emergency worker profile."""
    __tablename__ = "workers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    external_id = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    age_yrs = Column(Integer, nullable=False, default=32)
    sex = Column(String(8), nullable=False, default="M") # M or F
    body_mass_kg = Column(Float, nullable=False, default=75.0)
    height_cm = Column(Float, nullable=False, default=175.0)
    bmi = Column(Float, nullable=True)
    body_fat_pct = Column(Float, nullable=True)
    vo2peak_ml_kg_min = Column(Float, nullable=True)
    acclimation_status = Column(Integer, nullable=False, default=1) # 0=none, 1=short, 2=long
    created_at = Column(DateTime, default=now_utc_naive)

    # Relationships
    sessions = relationship("WorkSessionModel", back_populates="worker", cascade="all, delete-orphan")

class WorkSessionModel(Base):
    """Specific occupational heat exposure shift or intervention."""
    __tablename__ = "work_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    worker_id = Column(String(36), ForeignKey("workers.id"), nullable=False, index=True)
    start_time = Column(DateTime, default=now_utc_naive, nullable=False)
    end_time = Column(DateTime, nullable=True)
    clothing_type = Column(String(32), default="heavy_ppe")
    clothing_clo = Column(Float, default=1.2)
    workload_intensity = Column(String(32), default="moderate")
    location_name = Column(String(128), default="Jobsite Alpha")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(32), default="active") # active | completed | aborted_emergency

    # Relationships
    worker = relationship("WorkerModel", back_populates="sessions")
    telemetry_readings = relationship("TelemetryReadingModel", back_populates="session", cascade="all, delete-orphan")
    safety_alerts = relationship("SafetyAlertModel", back_populates="session", cascade="all, delete-orphan")
    hydration_logs = relationship("HydrationLogModel", back_populates="session", cascade="all, delete-orphan")

class TelemetryReadingModel(Base):
    """Time-series sensor reading snapshot & Model A/B/D inference result."""
    __tablename__ = "telemetry_readings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("work_sessions.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=now_utc_naive, nullable=False)
    timestamp_min = Column(Float, default=0.0)

    # Raw / Preprocessed Sensor Inputs
    heart_rate_bpm = Column(Float, nullable=True)
    skin_temp_mean_C = Column(Float, nullable=True)
    breathing_rate_bpm = Column(Float, nullable=True)
    air_temp_C = Column(Float, nullable=True)
    relative_humidity_pct = Column(Float, nullable=True)
    wind_speed_m_s = Column(Float, nullable=True)
    solar_radiation_W_m2 = Column(Float, nullable=True)
    heat_index_C = Column(Float, nullable=True)
    wbgt_C = Column(Float, nullable=True)

    # Model A: Estimated Core Temperature (°C)
    estimated_core_temp_C = Column(Float, nullable=True)

    # Model D: Conformal Prediction Bounds
    core_temp_lower_bound_C = Column(Float, nullable=True)
    core_temp_upper_bound_C = Column(Float, nullable=True)
    sensor_quality_score = Column(Float, nullable=True)
    confidence_tier = Column(String(64), nullable=True)

    # Heat Strain Triage
    strain_zone = Column(String(32), default="GREEN") # GREEN | AMBER | ORANGE | RED | EMERGENCY_PURPLE

    # Model B: PWC Loss %
    pwc_loss_pct = Column(Float, nullable=True)

    emergency_flag = Column(Boolean, default=False)

    # Relationships
    session = relationship("WorkSessionModel", back_populates="telemetry_readings")

class SafetyAlertModel(Base):
    """Safety alerts and emergency escalation events."""
    __tablename__ = "safety_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("work_sessions.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=now_utc_naive, nullable=False)
    alert_type = Column(String(64), nullable=False) # HEAT_STRAIN | HEAT_STROKE | SYNCOPE | DEHYDRATION
    severity = Column(String(32), nullable=False) # ADVISORY | WARNING | CRITICAL_EMERGENCY
    title = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    action_required = Column(Text, nullable=True)
    acknowledged = Column(Boolean, default=False)

    # Relationships
    session = relationship("WorkSessionModel", back_populates="safety_alerts")

class HydrationLogModel(Base):
    """Pre/post exposure weigh-in logs & fluid balance computations."""
    __tablename__ = "hydration_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("work_sessions.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=now_utc_naive, nullable=False)
    pre_mass_kg = Column(Float, nullable=False)
    post_mass_kg = Column(Float, nullable=False)
    mass_loss_pct = Column(Float, nullable=False)
    fluid_deficit_L = Column(Float, nullable=False)
    loss_rate_L_hr = Column(Float, nullable=False)
    replacement_target_L = Column(Float, nullable=False)
    status = Column(String(64), nullable=False)

    # Relationships
    session = relationship("WorkSessionModel", back_populates="hydration_logs")
