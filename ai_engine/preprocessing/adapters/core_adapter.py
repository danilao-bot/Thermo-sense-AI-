"""CORE Wearable Sensor Validity Adapter for ThermoSense AI.

Transforms the CORE sensor validation cohort demographics (24 participants)
into the canonical schema for cross-dataset calibration and baseline physiological profiling.
"""

import os
from typing import Optional
import numpy as np
import pandas as pd
from ai_engine.preprocessing.adapters.base import BaseAdapter

class CoreAdapter(BaseAdapter):
    """Adapter for CORE Wearable Validity cohort."""

    def __init__(self, raw_data_path: Optional[str] = None):
        if raw_data_path is None:
            raw_data_path = os.path.join(
                "ai_engine", "data", "raw", "CORE_Wearable_Sensor_Validity_Subjects.csv"
            )
        super().__init__(raw_data_path=raw_data_path, dataset_name="CORE")

    def adapt(self) -> pd.DataFrame:
        """Parses and transforms CORE cohort subjects."""
        df_raw = pd.read_csv(self.raw_data_path)

        rows = []
        for idx, row in df_raw.iterrows():
            subj_id = str(row.get("Subject", f"S{idx:02d}"))
            part_id = f"CORE_{subj_id}"
            session_id = f"{part_id}_BASE"
            record_id = f"{session_id}_T00"

            sex_str = str(row.get("Sex", "")).strip().upper()
            sex_val = 1.0 if sex_str in ["M", "1", "MALE"] else (0.0 if sex_str in ["F", "0", "FEMALE"] else np.nan)

            age_val = float(row.get("Age_yrs", np.nan))
            height_val = float(row.get("Height_cm", np.nan))
            mass_val = float(row.get("Body_Mass_kg", np.nan))
            bmi_val = float(row.get("BMI_kg_m2", np.nan))
            vo2_val = float(row.get("VO2peak_ml_kg_min", np.nan))

            rows.append({
                "record_id": record_id,
                "source_dataset": "CORE",
                "participant_id": part_id,
                "session_id": session_id,
                "timestamp_min": 0.0,

                "age_yrs": age_val,
                "sex": sex_val,
                "body_mass_kg": mass_val,
                "height_cm": height_val,
                "bmi_kg_m2": bmi_val,
                "body_fat_pct": np.nan,
                "vo2peak_ml_kg_min": vo2_val,
                "acclimation_status": np.nan,
                "training_status": 1.0 if (pd.notna(vo2_val) and vo2_val > 45.0) else 0.0,

                "air_temp_C": np.nan,
                "relative_humidity_pct": np.nan,
                "wind_speed_m_s": np.nan,
                "solar_radiation_W_m2": 0.0,
                "clothing_type": "light",
                "clothing_clo": 0.6,

                "under_clothing_temp_C": np.nan,
                "under_clothing_rh_pct": np.nan,

                "core_temp_C": 37.0, # Resting baseline calibration
                "heart_rate_bpm": np.nan,
                "breathing_rate_bpm": np.nan,
                "skin_temp_mean_C": np.nan,
                "skin_temp_abdomen_C": np.nan,
                "skin_temp_chest_C": np.nan,
                "skin_temp_calf_C": np.nan,
                "spo2_pct": np.nan,
                "steps_per_min": 0.0,

                "hrv_rmssd_ms": np.nan,
                "hrv_pnn50_pct": np.nan,
                "hrv_lf_power": np.nan,
                "hrv_hf_power": np.nan,
                "hrv_lf_hf_ratio": np.nan,

                "body_mass_pre_kg": mass_val,
                "body_mass_post_kg": np.nan,
                "total_body_water_pre_L": np.nan,
                "total_body_water_post_L": np.nan,
                "sweat_production_L": np.nan,

                "activity_code": 0.0,
                "work_duration_min": 0.0,
                "treadmill_speed_km_h": np.nan,
                "treadmill_gradient_pct": np.nan,
                "rpe": np.nan,

                "core_temp_target_C": np.nan,
                "pwc_loss_pct": np.nan,
                "body_mass_change_pct": np.nan,

                "measurement_quality": 1.0,
                "data_provenance": "measured",
            })

        return pd.DataFrame(rows)
