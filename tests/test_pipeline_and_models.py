"""Unit and Integration Tests for ThermoSense AI Preprocessing and Models."""

import pytest
import numpy as np
import pandas as pd
from ai_engine.preprocessing.schema import CANONICAL_COLUMNS, validate_canonical_df, create_empty_canonical_df
from ai_engine.features.feature_pipeline import FeaturePipeline
from ai_engine.models.inference import ThermoSensePredictor

def test_canonical_schema_initialization():
    df = create_empty_canonical_df()
    assert list(df.columns) == list(CANONICAL_COLUMNS.keys())
    assert len(df) == 0

def test_validate_canonical_df():
    sample = pd.DataFrame({
        "record_id": ["REC_01"],
        "source_dataset": ["PROSPIE"],
        "core_temp_C": [37.8],
    })
    validated = validate_canonical_df(sample)
    assert set(validated.columns) == set(CANONICAL_COLUMNS.keys())
    assert validated["core_temp_C"].iloc[0] == 37.8
    assert pd.isna(validated["heart_rate_bpm"].iloc[0])

def test_feature_pipeline_execution():
    pipeline = FeaturePipeline()
    dummy_data = pd.DataFrame({
        "record_id": [f"REC_{i:02d}" for i in range(12)],
        "source_dataset": ["PROSPIE"] * 12,
        "participant_id": ["P01"] * 12,
        "session_id": ["S01"] * 12,
        "timestamp_min": [float(i * 5) for i in range(12)],
        "age_yrs": [28.0] * 12,
        "sex": [1.0] * 12,
        "body_mass_kg": [75.0] * 12,
        "height_cm": [178.0] * 12,
        "bmi_kg_m2": [23.7] * 12,
        "body_fat_pct": [14.0] * 12,
        "vo2peak_ml_kg_min": [50.0] * 12,
        "acclimation_status": [1.0] * 12,
        "training_status": [1.0] * 12,
        "air_temp_C": [32.0] * 12,
        "relative_humidity_pct": [55.0] * 12,
        "wind_speed_m_s": [0.3] * 12,
        "solar_radiation_W_m2": [200.0] * 12,
        "clothing_type": ["permeable"] * 12,
        "clothing_clo": [1.0] * 12,
        "under_clothing_temp_C": [34.0] * 12,
        "under_clothing_rh_pct": [60.0] * 12,
        "core_temp_C": [37.0 + i * 0.1 for i in range(12)],
        "heart_rate_bpm": [80.0 + i * 5.0 for i in range(12)],
        "breathing_rate_bpm": [14.0 + i * 0.5 for i in range(12)],
        "skin_temp_mean_C": [33.5 + i * 0.1 for i in range(12)],
        "skin_temp_abdomen_C": [33.5] * 12,
        "skin_temp_chest_C": [34.0] * 12,
        "skin_temp_calf_C": [32.0] * 12,
        "spo2_pct": [98.0] * 12,
        "steps_per_min": [40.0] * 12,
        "hrv_rmssd_ms": [45.0] * 12,
        "hrv_pnn50_pct": [10.0] * 12,
        "hrv_lf_power": [100.0] * 12,
        "hrv_hf_power": [80.0] * 12,
        "hrv_lf_hf_ratio": [1.25] * 12,
        "body_mass_pre_kg": [75.0] * 12,
        "body_mass_post_kg": [74.2] * 12,
        "total_body_water_pre_L": [45.0] * 12,
        "total_body_water_post_L": [44.2] * 12,
        "sweat_production_L": [0.8] * 12,
        "activity_code": [2.0] * 12,
        "work_duration_min": [float(i * 5) for i in range(12)],
        "treadmill_speed_km_h": [4.5] * 12,
        "treadmill_gradient_pct": [2.0] * 12,
        "rpe": [12.0] * 12,
        "core_temp_target_C": [37.0 + i * 0.1 for i in range(12)],
        "pwc_loss_pct": [15.0] * 12,
        "body_mass_change_pct": [1.07] * 12,
        "measurement_quality": [1.0] * 12,
        "data_provenance": ["measured"] * 12,
    })
    transformed = pipeline.transform(dummy_data)
    assert len(transformed) == 12
    assert "core_skin_gradient" in transformed.columns
    assert "physiological_strain_index" in transformed.columns
    assert "heat_index_C" in transformed.columns
    assert "thermal_load_index" in transformed.columns

def test_thermosense_predictor_inference():
    predictor = ThermoSensePredictor()
    assert predictor.model_a is not None
    assert predictor.model_b is not None

    # Test Model A inference with Model D Conformal Bounds & Safety Alerts
    telemetry = {
        "heart_rate_bpm": 130.0,
        "heart_rate_bpm_rolling_mean_15m": 125.0,
        "skin_temp_mean_C": 35.0,
        "work_duration_min": 25.0,
        "air_temp_C": 32.0,
        "relative_humidity_pct": 50.0,
        "age_yrs": 30.0,
    }
    out_a = predictor.predict_heat_strain(telemetry)
    assert 36.0 <= out_a["core_temp"]["point_estimate_C"] <= 41.0
    assert out_a["core_temp"]["lower_bound_C"] <= out_a["core_temp"]["upper_bound_C"]
    assert out_a["safety_status"] in ["GREEN", "AMBER", "ORANGE", "RED", "EMERGENCY_PURPLE"]
    assert "heat_strain_details" in out_a
    assert "heat_stroke_details" in out_a
    assert "heat_syncope_details" in out_a

    # Test Emergency Escalation Trigger
    emergency_telemetry = {
        "heart_rate_bpm": 178.0,
        "skin_temp_mean_C": 38.5,
        "work_duration_min": 50.0,
        "core_temp_C_rate_of_change": 0.03, # rapid surge
        "air_temp_C": 42.0,
        "relative_humidity_pct": 70.0,
    }
    out_emerg = predictor.predict_heat_strain(emergency_telemetry)
    assert out_emerg["emergency_escalation"] is True
    assert len(out_emerg["active_alerts"]) > 0

    # Test Model B inference
    env_data = {
        "air_temp_C": 35.0,
        "relative_humidity_pct": 60.0,
        "clothing_clo": 1.0,
        "solar_radiation_W_m2": 400.0,
        "work_duration_min": 45.0,
    }
    out_b = predictor.predict_pwc_loss(env_data)
    assert 0.0 <= out_b["pwc_loss"]["point_estimate_pct"] <= 100.0
    assert out_b["pwc_loss"]["lower_bound_pct"] <= out_b["pwc_loss"]["upper_bound_pct"]

    # Test Model C hydration calculation
    out_c = predictor.calculate_hydration_status(mass_pre_kg=80.0, mass_post_kg=78.8, duration_min=40.0)
    assert out_c["body_mass_loss_pct"] == 1.5
    assert out_c["fluid_loss_liters"] == 1.2
