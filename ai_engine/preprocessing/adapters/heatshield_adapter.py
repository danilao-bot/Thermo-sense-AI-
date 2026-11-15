"""HEATSHIELD Dataset Adapter for ThermoSense AI.

Transforms the HEATSHIELD occupational heat-stress dataset (975 exposure sessions
across 75 climate/work conditions) into the canonical schema.
Provides physical work capacity loss (PWC loss %, target for Model B),
environmental metrics (T_db, RH, wind, solar), clothing insulation,
skin and core temperature, and thermal sensation votes.
"""

import os
from typing import Optional
import numpy as np
import pandas as pd
from ai_engine.preprocessing.adapters.base import BaseAdapter

class HeatshieldAdapter(BaseAdapter):
    """Adapter for HEATSHIELD individual sessions dataset."""

    def __init__(self, raw_data_path: Optional[str] = None):
        if raw_data_path is None:
            raw_data_path = os.path.join(
                "ai_engine", "data", "raw", "HEATSHIELD_D2_individual_sessions_SYNTHETIC.csv"
            )
        super().__init__(raw_data_path=raw_data_path, dataset_name="HEATSHIELD")

    def adapt(self) -> pd.DataFrame:
        """Parses and transforms HEATSHIELD sessions."""
        df_raw = pd.read_csv(self.raw_data_path)

        rows = []
        for idx, row in df_raw.iterrows():
            part_id = f"HS_{str(row.get('participant_id', f'P{idx:03d}'))}"
            sess_id = f"HS_{str(row.get('session_id', f'S{idx:03d}'))}"
            record_id = f"{sess_id}_T00"

            sex_str = str(row.get("sex", "")).strip().lower()
            sex_val = 1.0 if sex_str in ["m", "male", "1", "1.0"] else (0.0 if sex_str in ["f", "female", "0", "0.0"] else np.nan)

            acclim_raw = row.get("acclimated", 0)
            acclim_val = 1.0 if acclim_raw in [1, True, "1", "true", "True"] else 0.0

            clothing_str = str(row.get("clothing", "light")).lower()
            if "semi" in clothing_str or "nude" in clothing_str:
                c_type = "semi-nude"
            elif "impermeable" in clothing_str:
                c_type = "impermeable"
            elif "ppe" in clothing_str:
                c_type = "heavy_ppe"
            elif "coverall" in clothing_str or "permeable" in clothing_str:
                c_type = "permeable"
            else:
                c_type = "light"

            t_air = float(row.get("T_db_C", np.nan))
            rh = float(row.get("RH_pct", np.nan))
            wind = float(row.get("wind_m_s", np.nan))
            solar = float(row.get("solar_radiation_W_m2", 0.0))
            clo = float(row.get("clothing_clo", 0.6))
            duration = float(row.get("work_duration_min", 60.0))

            pwc_loss = float(row.get("PWC_loss_pct", np.nan))
            t_skin = float(row.get("T_skin_C", np.nan))
            t_core = float(row.get("T_core_C", np.nan))
            rpe_or_tsv = float(row.get("thermal_sensation_vote", np.nan))

            mass_val = float(row.get("body_mass_kg", np.nan))
            age_val = float(row.get("age_yrs", np.nan))
            vo2_val = float(row.get("VO2peak_ml_kg_min", np.nan))

            rows.append({
                "record_id": record_id,
                "source_dataset": "HEATSHIELD",
                "participant_id": part_id,
                "session_id": sess_id,
                "timestamp_min": duration,

                "age_yrs": age_val,
                "sex": sex_val,
                "body_mass_kg": mass_val,
                "height_cm": np.nan,
                "bmi_kg_m2": np.nan,
                "body_fat_pct": np.nan,
                "vo2peak_ml_kg_min": vo2_val,
                "acclimation_status": acclim_val,
                "training_status": 1.0 if (pd.notna(vo2_val) and vo2_val > 45) else 0.0,

                "air_temp_C": t_air,
                "relative_humidity_pct": rh,
                "wind_speed_m_s": wind,
                "solar_radiation_W_m2": solar,
                "clothing_type": c_type,
                "clothing_clo": clo,

                "under_clothing_temp_C": np.nan,
                "under_clothing_rh_pct": np.nan,

                "core_temp_C": t_core,
                "heart_rate_bpm": np.nan,
                "breathing_rate_bpm": np.nan,
                "skin_temp_mean_C": t_skin,
                "skin_temp_abdomen_C": np.nan,
                "skin_temp_chest_C": np.nan,
                "skin_temp_calf_C": np.nan,
                "spo2_pct": np.nan,
                "steps_per_min": np.nan,

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

                "activity_code": 2.0, # Standard occupational physical work
                "work_duration_min": duration,
                "treadmill_speed_km_h": np.nan,
                "treadmill_gradient_pct": np.nan,
                "rpe": rpe_or_tsv,

                "core_temp_target_C": t_core,
                "pwc_loss_pct": pwc_loss, # PRIMARY TARGET for Model B
                "body_mass_change_pct": np.nan,

                "measurement_quality": 0.95,
                "data_provenance": "synthetic",
            })

        return pd.DataFrame(rows)
