"""PROSPIE Dataset Adapter for ThermoSense AI.

Transforms raw PROSPIE laboratory heat-stress experiment data into the canonical schema.
Raw data contains 17,264 minute-level observations across 40 human participants
wearing permeable or impermeable PPE under hot controlled conditions.
"""

import os
from typing import Optional
import numpy as np
import pandas as pd
from ai_engine.preprocessing.adapters.base import BaseAdapter

class ProspieAdapter(BaseAdapter):
    """Adapter for PROSPIE dataset."""

    def __init__(self, raw_data_path: Optional[str] = None):
        if raw_data_path is None:
            raw_data_path = os.path.join("ai_engine", "data", "raw", "Prospie dataset_open access V3.xlsx")
        super().__init__(raw_data_path=raw_data_path, dataset_name="PROSPIE")

    def adapt(self) -> pd.DataFrame:
        """Parses and transforms PROSPIE data sheet."""
        # Read raw data skipping the 2 header rows
        df_raw = pd.read_excel(self.raw_data_path, sheet_name="Data", skiprows=2, header=None)
        
        # Replace sentinel 9999 with NaN across all numeric data
        df_raw = df_raw.replace(9999, np.nan).replace(9999.0, np.nan).replace("9999", np.nan)

        records = []
        n_rows = len(df_raw)

        # Pre-extract raw columns for speed
        col_cond = df_raw[0].values
        col_time = df_raw[1].values
        col_act_code = pd.to_numeric(df_raw[2], errors="coerce").values
        col_part = df_raw[3].values
        col_sex = pd.to_numeric(df_raw[4], errors="coerce").values # 1=M, 2=F
        col_age = pd.to_numeric(df_raw[5], errors="coerce").values
        col_mass = pd.to_numeric(df_raw[6], errors="coerce").values
        col_height = pd.to_numeric(df_raw[7], errors="coerce").values # cm
        col_fat = pd.to_numeric(df_raw[8], errors="coerce").values
        col_vo2 = pd.to_numeric(df_raw[9], errors="coerce").values
        col_acclim = pd.to_numeric(df_raw[10], errors="coerce").values # 1=none, 2=short, 3=long
        col_train = pd.to_numeric(df_raw[11], errors="coerce").values # 1=trained, 2=untrained
        col_cloth = pd.to_numeric(df_raw[12], errors="coerce").values # 1=coveralls, 2=impermeable

        col_rh_env = pd.to_numeric(df_raw[13], errors="coerce").values
        col_temp_env = pd.to_numeric(df_raw[14], errors="coerce").values
        col_wind = pd.to_numeric(df_raw[15], errors="coerce").values

        col_tfront = pd.to_numeric(df_raw[16], errors="coerce").values
        col_rhfront = pd.to_numeric(df_raw[17], errors="coerce").values
        col_tback = pd.to_numeric(df_raw[18], errors="coerce").values
        col_rhback = pd.to_numeric(df_raw[19], errors="coerce").values

        col_workrest = pd.to_numeric(df_raw[20], errors="coerce").values
        col_speed = pd.to_numeric(df_raw[22], errors="coerce").values
        col_grad = pd.to_numeric(df_raw[23], errors="coerce").values
        col_solar_rad = pd.to_numeric(df_raw[25], errors="coerce").values
        col_sweat = pd.to_numeric(df_raw[28], errors="coerce").values
        col_core = pd.to_numeric(df_raw[29], errors="coerce").values

        # Skin temps: 31=abdomen, 32=calf, 33=chest, 34=foot, 35=hand, 36=head, 
        # 37=lower arm, 38=lower back, 39=thigh, 40=upper arm, 41=upper back
        skin_abdomen = pd.to_numeric(df_raw[31], errors="coerce").values
        skin_calf = pd.to_numeric(df_raw[32], errors="coerce").values
        skin_chest = pd.to_numeric(df_raw[33], errors="coerce").values
        skin_foot = pd.to_numeric(df_raw[34], errors="coerce").values
        skin_hand = pd.to_numeric(df_raw[35], errors="coerce").values
        skin_head = pd.to_numeric(df_raw[36], errors="coerce").values
        skin_larm = pd.to_numeric(df_raw[37], errors="coerce").values
        skin_lback = pd.to_numeric(df_raw[38], errors="coerce").values
        skin_thigh = pd.to_numeric(df_raw[39], errors="coerce").values
        skin_uarm = pd.to_numeric(df_raw[40], errors="coerce").values
        skin_uback = pd.to_numeric(df_raw[41], errors="coerce").values

        col_br = pd.to_numeric(df_raw[44], errors="coerce").values
        col_hr = pd.to_numeric(df_raw[45], errors="coerce").values
        col_rpe = pd.to_numeric(df_raw[51], errors="coerce").values
        col_rmssd_man = pd.to_numeric(df_raw[54], errors="coerce").values
        col_rmssd_soft = pd.to_numeric(df_raw[57], errors="coerce").values

        canonical_rows = []

        for i in range(n_rows):
            part_id = f"PROSPIE_P{int(col_part[i])}" if pd.notna(col_part[i]) else "PROSPIE_P_UNKNOWN"
            cond_id = int(col_cond[i]) if pd.notna(col_cond[i]) else 0
            session_id = f"{part_id}_C{cond_id}"
            
            # Timestamp in minutes
            t_val = col_time[i]
            if hasattr(t_val, "hour"):
                t_min = t_val.hour * 60.0 + t_val.minute + t_val.second / 60.0
            else:
                try:
                    parts = str(t_val).split(":")
                    if len(parts) == 3:
                        t_min = float(parts[0]) * 60.0 + float(parts[1]) + float(parts[2]) / 60.0
                    elif len(parts) == 2:
                        t_min = float(parts[0]) * 60.0 + float(parts[1])
                    else:
                        t_min = float(i)
                except Exception:
                    t_min = float(i)

            record_id = f"{session_id}_T{int(round(t_min)):04d}"

            # Demographics
            sex_val = 1.0 if col_sex[i] == 1 else (0.0 if col_sex[i] == 2 else np.nan)
            height_val = float(col_height[i]) if pd.notna(col_height[i]) else np.nan
            mass_val = float(col_mass[i]) if pd.notna(col_mass[i]) else np.nan
            bmi_val = np.nan
            if pd.notna(height_val) and pd.notna(mass_val) and height_val > 50:
                h_m = height_val / 100.0
                bmi_val = mass_val / (h_m * h_m)

            # Acclimation: 1=none (0), 2=short (1), 3=long (2)
            acclim_code = 0.0
            if col_acclim[i] == 2:
                acclim_code = 1.0
            elif col_acclim[i] == 3:
                acclim_code = 2.0

            # Training: 1=trained (1), 2=untrained (0)
            train_code = 1.0 if col_train[i] == 1 else (0.0 if col_train[i] == 2 else np.nan)

            # Clothing: 1=coveralls (permeable, ~1.0 clo), 2=impermeable suit (~1.2 clo)
            c_type = "permeable" if col_cloth[i] == 1 else ("impermeable" if col_cloth[i] == 2 else "unknown")
            clo_val = 1.07 if col_cloth[i] == 1 else (1.15 if col_cloth[i] == 2 else np.nan)

            # Under-clothing microclimate
            t_micro_vals = [v for v in [col_tfront[i], col_tback[i]] if pd.notna(v) and v < 60]
            rh_micro_vals = [v for v in [col_rhfront[i], col_rhback[i]] if pd.notna(v) and v <= 100]
            under_temp = float(np.mean(t_micro_vals)) if len(t_micro_vals) > 0 else np.nan
            under_rh = float(np.mean(rh_micro_vals)) if len(rh_micro_vals) > 0 else np.nan

            # Mean skin temp from 11 sites (filtering valid physiological range 20-45°C)
            skin_all = [
                skin_abdomen[i], skin_calf[i], skin_chest[i], skin_foot[i], skin_hand[i],
                skin_head[i], skin_larm[i], skin_lback[i], skin_thigh[i], skin_uarm[i], skin_uback[i]
            ]
            valid_skin = [v for v in skin_all if pd.notna(v) and 20.0 <= v <= 45.0]
            mean_skin = float(np.mean(valid_skin)) if len(valid_skin) >= 3 else np.nan

            # Core temp
            core_val = float(col_core[i]) if (pd.notna(col_core[i]) and 34.0 <= col_core[i] <= 42.0) else np.nan

            # HRV (prefer software, fallback manual)
            rmssd_val = col_rmssd_soft[i] if pd.notna(col_rmssd_soft[i]) else col_rmssd_man[i]
            if pd.notna(rmssd_val) and rmssd_val > 500: # filter extreme artifacts
                rmssd_val = np.nan

            # Activity code mapping
            # workrest: 1=work (2=moderate), 2=rest (0=rest)
            act_code = 2.0 if col_workrest[i] == 1 else (0.0 if col_workrest[i] == 2 else np.nan)

            # Heart rate filter
            hr_val = float(col_hr[i]) if (pd.notna(col_hr[i]) and 30.0 <= col_hr[i] <= 220.0) else np.nan

            # Breathing rate filter
            br_val = float(col_br[i]) if (pd.notna(col_br[i]) and 5.0 <= col_br[i] <= 70.0) else np.nan

            canonical_rows.append({
                "record_id": record_id,
                "source_dataset": "PROSPIE",
                "participant_id": part_id,
                "session_id": session_id,
                "timestamp_min": t_min,

                "age_yrs": float(col_age[i]) if pd.notna(col_age[i]) else np.nan,
                "sex": sex_val,
                "body_mass_kg": mass_val,
                "height_cm": height_val,
                "bmi_kg_m2": bmi_val,
                "body_fat_pct": float(col_fat[i]) if pd.notna(col_fat[i]) else np.nan,
                "vo2peak_ml_kg_min": float(col_vo2[i]) if pd.notna(col_vo2[i]) else np.nan,
                "acclimation_status": acclim_code,
                "training_status": train_code,

                "air_temp_C": float(col_temp_env[i]) if pd.notna(col_temp_env[i]) else np.nan,
                "relative_humidity_pct": float(col_rh_env[i]) if pd.notna(col_rh_env[i]) else np.nan,
                "wind_speed_m_s": float(col_wind[i]) if pd.notna(col_wind[i]) else np.nan,
                "solar_radiation_W_m2": float(col_solar_rad[i]) if pd.notna(col_solar_rad[i]) else 0.0,
                "clothing_type": c_type,
                "clothing_clo": clo_val,

                "under_clothing_temp_C": under_temp,
                "under_clothing_rh_pct": under_rh,

                "core_temp_C": core_val,
                "heart_rate_bpm": hr_val,
                "breathing_rate_bpm": br_val,
                "skin_temp_mean_C": mean_skin,
                "skin_temp_abdomen_C": float(skin_abdomen[i]) if pd.notna(skin_abdomen[i]) and 20 <= skin_abdomen[i] <= 45 else np.nan,
                "skin_temp_chest_C": float(skin_chest[i]) if pd.notna(skin_chest[i]) and 20 <= skin_chest[i] <= 45 else np.nan,
                "skin_temp_calf_C": float(skin_calf[i]) if pd.notna(skin_calf[i]) and 20 <= skin_calf[i] <= 45 else np.nan,
                "spo2_pct": np.nan,
                "steps_per_min": np.nan,

                "hrv_rmssd_ms": float(rmssd_val) if pd.notna(rmssd_val) else np.nan,
                "hrv_pnn50_pct": np.nan,
                "hrv_lf_power": np.nan,
                "hrv_hf_power": np.nan,
                "hrv_lf_hf_ratio": np.nan,

                "body_mass_pre_kg": mass_val,
                "body_mass_post_kg": np.nan,
                "total_body_water_pre_L": np.nan,
                "total_body_water_post_L": np.nan,
                "sweat_production_L": float(col_sweat[i]) if pd.notna(col_sweat[i]) else np.nan,

                "activity_code": act_code,
                "work_duration_min": t_min,
                "treadmill_speed_km_h": float(col_speed[i]) if pd.notna(col_speed[i]) else np.nan,
                "treadmill_gradient_pct": float(col_grad[i]) if pd.notna(col_grad[i]) else np.nan,
                "rpe": float(col_rpe[i]) if (pd.notna(col_rpe[i]) and 6 <= col_rpe[i] <= 20) else np.nan,

                "core_temp_target_C": core_val,
                "pwc_loss_pct": np.nan,
                "body_mass_change_pct": np.nan,

                "measurement_quality": 1.0 if pd.notna(core_val) and pd.notna(hr_val) else 0.7,
                "data_provenance": "measured",
            })

        return pd.DataFrame(canonical_rows)
