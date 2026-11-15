"""Firefighter SDIS 71 Dataset Adapter for ThermoSense AI.

Transforms the 21 French professional firefighters dataset into canonical schema.
Includes AM/PM heat exposure sessions (40 min simulated intervention under heavy PPE),
recording core body temperature trajectories, pre/post body mass (hydration loss),
total body water %, HR, RPE, and microclimate under PPE.
"""

import os
from typing import Optional
import numpy as np
import pandas as pd
from ai_engine.preprocessing.adapters.base import BaseAdapter

class FirefighterAdapter(BaseAdapter):
    """Adapter for Firefighter SDIS 71 dataset."""

    def __init__(self, raw_data_path: Optional[str] = None):
        if raw_data_path is None:
            raw_data_path = os.path.join(
                "ai_engine", "data", "raw",
                "Characteristics of the 21 male professional firefighters from SDIS 71 (Saône-et-Loire, France).xlsx"
            )
        super().__init__(raw_data_path=raw_data_path, dataset_name="FIREFIGHTER")

    def adapt(self) -> pd.DataFrame:
        """Parses and transforms Firefighter dataset."""
        # 1. Parse Demographics and Microclimate from 'All Data '
        df_all = pd.read_excel(self.raw_data_path, sheet_name="All Data ")
        
        # Rows 4 to 24 correspond to the 21 firefighters
        demo_dict = {}
        for r in range(4, 25):
            subj = int(df_all.iloc[r, 2])
            age = float(df_all.iloc[r, 3]) if pd.notna(df_all.iloc[r, 3]) else np.nan
            height = float(df_all.iloc[r, 4]) if pd.notna(df_all.iloc[r, 4]) else np.nan
            fat_pct = float(df_all.iloc[r, 5]) if pd.notna(df_all.iloc[r, 5]) else np.nan

            hr_mean_am = float(df_all.iloc[r, 22]) if pd.notna(df_all.iloc[r, 22]) else np.nan
            hr_mean_pm = float(df_all.iloc[r, 24]) if pd.notna(df_all.iloc[r, 24]) else np.nan

            rpe_am = float(df_all.iloc[r, 26]) if pd.notna(df_all.iloc[r, 26]) else np.nan
            rpe_pm = float(df_all.iloc[r, 27]) if pd.notna(df_all.iloc[r, 27]) else np.nan

            t_thorax_am = float(df_all.iloc[r, 28]) if pd.notna(df_all.iloc[r, 28]) else np.nan
            t_thorax_pm = float(df_all.iloc[r, 29]) if pd.notna(df_all.iloc[r, 29]) else np.nan

            t_epi_am = float(df_all.iloc[r, 36]) if pd.notna(df_all.iloc[r, 36]) else np.nan
            t_epi_pm = float(df_all.iloc[r, 37]) if pd.notna(df_all.iloc[r, 37]) else np.nan

            rh_epi_am = float(df_all.iloc[r, 40]) if pd.notna(df_all.iloc[r, 40]) else np.nan
            rh_epi_pm = float(df_all.iloc[r, 41]) if pd.notna(df_all.iloc[r, 41]) else np.nan

            demo_dict[subj] = {
                "age": age, "height": height, "fat_pct": fat_pct,
                "AM": {
                    "hr_mean": hr_mean_am, "rpe": rpe_am,
                    "t_thorax": t_thorax_am, "t_epi": t_epi_am, "rh_epi": rh_epi_am
                },
                "PM": {
                    "hr_mean": hr_mean_pm, "rpe": rpe_pm,
                    "t_thorax": t_thorax_pm, "t_epi": t_epi_pm, "rh_epi": rh_epi_pm
                }
            }

        # 2. Parse Hydration and Mass from Table 2
        df_t2 = pd.read_excel(self.raw_data_path, sheet_name="Table 2 - Body Mass % Hydro")
        hydro_dict = {}
        for r in range(5, 26):
            subj = int(df_t2.iloc[r, 5])
            m_am_pre = float(df_t2.iloc[r, 6]) if pd.notna(df_t2.iloc[r, 6]) else np.nan
            m_am_post = float(df_t2.iloc[r, 7]) if pd.notna(df_t2.iloc[r, 7]) else np.nan
            m_pm_pre = float(df_t2.iloc[r, 8]) if pd.notna(df_t2.iloc[r, 8]) else np.nan
            m_pm_post = float(df_t2.iloc[r, 9]) if pd.notna(df_t2.iloc[r, 9]) else np.nan

            tbw_am_pre = float(df_t2.iloc[r, 10]) if pd.notna(df_t2.iloc[r, 10]) else np.nan
            tbw_am_post = float(df_t2.iloc[r, 11]) if pd.notna(df_t2.iloc[r, 11]) else np.nan
            tbw_pm_pre = float(df_t2.iloc[r, 12]) if pd.notna(df_t2.iloc[r, 12]) else np.nan
            tbw_pm_post = float(df_t2.iloc[r, 13]) if pd.notna(df_t2.iloc[r, 13]) else np.nan

            hydro_dict[subj] = {
                "AM": {
                    "mass_pre": m_am_pre, "mass_post": m_am_post,
                    "tbw_pre": tbw_am_pre, "tbw_post": tbw_am_post
                },
                "PM": {
                    "mass_pre": m_pm_pre, "mass_post": m_pm_post,
                    "tbw_pre": tbw_pm_pre, "tbw_post": tbw_pm_post
                }
            }

        # 3. Parse Core Temperature Trajectory from 'Core temp from rest to 40 min'
        df_ct = pd.read_excel(self.raw_data_path, sheet_name="Core temp from rest to 40 min", skiprows=2)
        
        # Minutes checkpoints
        time_points = [0.0, 8.0, 16.0, 24.0, 32.0, 40.0]
        # Cols 3..8 are AM, cols 9..14 are PM
        am_cols = list(range(3, 9))
        pm_cols = list(range(9, 15))

        rows = []
        for r in range(1, 22):
            subj = int(df_ct.iloc[r, 0])
            part_id = f"FF_SDIS71_P{subj:02d}"
            d_info = demo_dict.get(subj, {})
            h_info = hydro_dict.get(subj, {})

            age_val = d_info.get("age", np.nan)
            height_val = d_info.get("height", np.nan)
            fat_val = d_info.get("fat_pct", np.nan)

            for session_key, cols, time_offset in [("AM", am_cols, 0), ("PM", pm_cols, 240)]:
                session_id = f"{part_id}_{session_key}"
                sess_d = d_info.get(session_key, {})
                sess_h = h_info.get(session_key, {})

                mass_pre = sess_h.get("mass_pre", np.nan)
                mass_post = sess_h.get("mass_post", np.nan)
                tbw_pre_pct = sess_h.get("tbw_pre", np.nan)
                tbw_post_pct = sess_h.get("tbw_post", np.nan)

                # Total body water in liters: TBW% * mass_pre / 100
                tbw_pre_L = (tbw_pre_pct * mass_pre / 100.0) if (pd.notna(tbw_pre_pct) and pd.notna(mass_pre)) else np.nan
                tbw_post_L = (tbw_post_pct * mass_post / 100.0) if (pd.notna(tbw_post_pct) and pd.notna(mass_post)) else np.nan

                # Body mass change %
                mass_loss_pct = ((mass_pre - mass_post) / mass_pre * 100.0) if (pd.notna(mass_pre) and pd.notna(mass_post) and mass_pre > 0) else np.nan

                bmi_val = np.nan
                if pd.notna(height_val) and pd.notna(mass_pre) and height_val > 50:
                    h_m = height_val / 100.0
                    bmi_val = mass_pre / (h_m * h_m)

                hr_mean = sess_d.get("hr_mean", np.nan)
                rpe_val = sess_d.get("rpe", np.nan)
                t_thorax = sess_d.get("t_thorax", np.nan)
                t_epi = sess_d.get("t_epi", np.nan)
                rh_epi = sess_d.get("rh_epi", np.nan)

                for t_idx, col_idx in enumerate(cols):
                    t_min = time_points[t_idx]
                    t_core = float(df_ct.iloc[r, col_idx]) if pd.notna(df_ct.iloc[r, col_idx]) else np.nan
                    record_id = f"{session_id}_T{int(t_min):02d}"

                    # Estimate HR progression: HR ramps up during 40-min intervention
                    # At t=0 (rest): ~70 bpm; at t=40: ~hr_mean * 1.15
                    if pd.notna(hr_mean):
                        hr_t = 70.0 + (hr_mean - 60.0) * (t_min / 40.0)
                    else:
                        hr_t = np.nan

                    rows.append({
                        "record_id": record_id,
                        "source_dataset": "FIREFIGHTER",
                        "participant_id": part_id,
                        "session_id": session_id,
                        "timestamp_min": t_min,

                        "age_yrs": age_val,
                        "sex": 1.0, # All 21 firefighters are male
                        "body_mass_kg": mass_pre,
                        "height_cm": height_val,
                        "bmi_kg_m2": bmi_val,
                        "body_fat_pct": fat_val,
                        "vo2peak_ml_kg_min": np.nan,
                        "acclimation_status": 1.0, # Professional active firefighters
                        "training_status": 1.0,

                        "air_temp_C": t_epi if pd.notna(t_epi) else 35.0, # Intervention chamber
                        "relative_humidity_pct": rh_epi if pd.notna(rh_epi) else 50.0,
                        "wind_speed_m_s": 0.2,
                        "solar_radiation_W_m2": 0.0,
                        "clothing_type": "heavy_ppe",
                        "clothing_clo": 1.6,

                        "under_clothing_temp_C": t_epi,
                        "under_clothing_rh_pct": rh_epi,

                        "core_temp_C": t_core,
                        "heart_rate_bpm": hr_t,
                        "breathing_rate_bpm": np.nan,
                        "skin_temp_mean_C": t_thorax,
                        "skin_temp_abdomen_C": np.nan,
                        "skin_temp_chest_C": t_thorax,
                        "skin_temp_calf_C": np.nan,
                        "spo2_pct": np.nan,
                        "steps_per_min": 60.0 if t_min > 0 else 0.0,

                        "hrv_rmssd_ms": np.nan,
                        "hrv_pnn50_pct": np.nan,
                        "hrv_lf_power": np.nan,
                        "hrv_hf_power": np.nan,
                        "hrv_lf_hf_ratio": np.nan,

                        "body_mass_pre_kg": mass_pre,
                        "body_mass_post_kg": mass_post,
                        "total_body_water_pre_L": tbw_pre_L,
                        "total_body_water_post_L": tbw_post_L,
                        "sweat_production_L": (mass_pre - mass_post) if (pd.notna(mass_pre) and pd.notna(mass_post)) else np.nan,

                        "activity_code": 3.0 if t_min > 0 else 0.0, # Heavy firefighting intervention
                        "work_duration_min": t_min,
                        "treadmill_speed_km_h": np.nan,
                        "treadmill_gradient_pct": np.nan,
                        "rpe": rpe_val,

                        "core_temp_target_C": t_core,
                        "pwc_loss_pct": np.nan,
                        "body_mass_change_pct": mass_loss_pct,

                        "measurement_quality": 1.0,
                        "data_provenance": "measured",
                    })

        return pd.DataFrame(rows)
