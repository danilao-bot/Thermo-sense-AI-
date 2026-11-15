"""Canonical Data Schema for ThermoSense AI.

This module defines the unified schema, data types, validation routines,
and constants used across all raw dataset adapters and feature engineering.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

# Canonical Schema column definitions and expected types
CANONICAL_COLUMNS: Dict[str, str] = {
    # Identity
    "record_id": "str",              # unique row identifier
    "source_dataset": "str",         # PROSPIE | EPA | FIREFIGHTER | HEATSHIELD | CORE
    "participant_id": "str",         # cross-dataset participant key
    "session_id": "str",             # exposure session identifier
    "timestamp_min": "float64",      # minutes from session start

    # Demographics (static per participant)
    "age_yrs": "float64",
    "sex": "float64",                # 0.0=F, 1.0=M
    "body_mass_kg": "float64",
    "height_cm": "float64",
    "bmi_kg_m2": "float64",
    "body_fat_pct": "float64",
    "vo2peak_ml_kg_min": "float64",
    "acclimation_status": "float64", # 0=none, 1=short, 2=long-term
    "training_status": "float64",    # 0=untrained, 1=trained

    # Environmental (measured or estimated)
    "air_temp_C": "float64",
    "relative_humidity_pct": "float64",
    "wind_speed_m_s": "float64",
    "solar_radiation_W_m2": "float64",
    "clothing_type": "str",          # permeable | impermeable | semi-nude | light | heavy_ppe
    "clothing_clo": "float64",

    # Under-clothing microclimate
    "under_clothing_temp_C": "float64",
    "under_clothing_rh_pct": "float64",

    # Physiological (measured)
    "core_temp_C": "float64",        # Target for Model A (measured or high-confidence reference)
    "heart_rate_bpm": "float64",
    "breathing_rate_bpm": "float64",
    "skin_temp_mean_C": "float64",
    "skin_temp_abdomen_C": "float64",
    "skin_temp_chest_C": "float64",
    "skin_temp_calf_C": "float64",
    "spo2_pct": "float64",
    "steps_per_min": "float64",

    # HRV
    "hrv_rmssd_ms": "float64",
    "hrv_pnn50_pct": "float64",
    "hrv_lf_power": "float64",
    "hrv_hf_power": "float64",
    "hrv_lf_hf_ratio": "float64",

    # Hydration (where available)
    "body_mass_pre_kg": "float64",
    "body_mass_post_kg": "float64",
    "total_body_water_pre_L": "float64",
    "total_body_water_post_L": "float64",
    "sweat_production_L": "float64",

    # Workload
    "activity_code": "float64",      # rest=0, light=1, moderate=2, heavy=3
    "work_duration_min": "float64",
    "treadmill_speed_km_h": "float64",
    "treadmill_gradient_pct": "float64",
    "rpe": "float64",                # Rate of Perceived Exertion (6-20 Borg scale)

    # Targets / Labels
    "core_temp_target_C": "float64", # Model A target
    "pwc_loss_pct": "float64",       # Model B target
    "body_mass_change_pct": "float64",# Model C indicator

    # Provenance
    "measurement_quality": "float64",# 0.0-1.0 quality score
    "data_provenance": "str",        # measured | estimated | derived | synthetic
}

# Categorical valid values
DATASET_NAMES = {"PROSPIE", "EPA", "FIREFIGHTER", "HEATSHIELD", "CORE"}
PROVENANCE_TYPES = {"measured", "estimated", "derived", "synthetic"}
CLOTHING_TYPES = {"permeable", "impermeable", "semi-nude", "light", "heavy_ppe", "unknown"}

def create_empty_canonical_df() -> pd.DataFrame:
    """Creates an empty DataFrame with the canonical schema columns and types."""
    df = pd.DataFrame()
    for col, dtype in CANONICAL_COLUMNS.items():
        if dtype == "str":
            df[col] = pd.Series(dtype="object")
        else:
            df[col] = pd.Series(dtype=dtype)
    return df

def validate_canonical_df(df: pd.DataFrame, strict: bool = False) -> pd.DataFrame:
    """Validates and enforces canonical schema constraints on a DataFrame.
    
    Args:
        df: Input DataFrame produced by an adapter.
        strict: If True, raises exceptions on missing columns; if False, adds missing columns as NaN/None.
        
    Returns:
        Standardized DataFrame with all canonical columns.
    """
    out = df.copy()
    for col, dtype in CANONICAL_COLUMNS.items():
        if col not in out.columns:
            if strict:
                raise ValueError(f"Missing required canonical column: {col}")
            if dtype == "str":
                out[col] = ""
            else:
                out[col] = np.nan
        else:
            if dtype.startswith("float"):
                out[col] = pd.to_numeric(out[col], errors="coerce")
            elif dtype == "str":
                out[col] = out[col].astype(str).replace({"nan": "", "None": "", "np.nan": ""})

    # Order columns consistently
    out = out[list(CANONICAL_COLUMNS.keys())]
    return out
