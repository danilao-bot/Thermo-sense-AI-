"""EPA Wearables Dataset Adapter for ThermoSense AI.

Transforms raw EPA Wearables field pilot data into the canonical schema.
Raw dataset contains minute-level time-series across 8 participants wearing PPE + 1 control,
measuring HR, estimated core temperature (USARIEM eCBT), HRV (RMSSD, pNN50, LF/HF),
respiration rate, SpO2, and step counts.
"""

import os
from typing import Optional
import numpy as np
import pandas as pd
from ai_engine.preprocessing.adapters.base import BaseAdapter

class EPAAdapter(BaseAdapter):
    """Adapter for EPA Wearables dataset."""

    def __init__(self, raw_data_path: Optional[str] = None):
        if raw_data_path is None:
            raw_data_path = os.path.join("ai_engine", "data", "raw", "EPA_WearablesPaper_Data.xlsx")
        super().__init__(raw_data_path=raw_data_path, dataset_name="EPA")

    def adapt(self) -> pd.DataFrame:
        """Parses and transforms all participant sheets in EPA Wearables file."""
        xl = pd.ExcelFile(self.raw_data_path)
        sheet_names = [s for s in xl.sheet_names if s.startswith("EPA") or s == "Control"]

        all_records = []

        for sheet in sheet_names:
            df_sheet = xl.parse(sheet)
            if df_sheet.empty or "unix" not in df_sheet.columns:
                continue

            # Sort by unix timestamp
            df_sheet = df_sheet.sort_values("unix").reset_index(drop=True)
            t0 = df_sheet["unix"].iloc[0]

            part_id = f"EPA_{sheet}"
            session_id = f"{part_id}_S1"

            for idx, row in df_sheet.iterrows():
                unix_val = row.get("unix", np.nan)
                if pd.isna(unix_val):
                    t_min = float(idx)
                else:
                    t_min = (float(unix_val) - float(t0)) / 60.0

                record_id = f"{session_id}_T{int(round(t_min)):04d}"

                hr = row.get("heartrate", np.nan)
                hr_val = float(hr) if (pd.notna(hr) and 35.0 <= hr <= 220.0) else np.nan

                ecbt = row.get("usariem_eCBT", np.nan)
                core_val = float(ecbt) if (pd.notna(ecbt) and 34.0 <= ecbt <= 42.0) else np.nan

                resp = row.get("avg_resp", np.nan)
                resp_val = float(resp) if (pd.notna(resp) and 4.0 <= resp <= 60.0) else np.nan

                spo2 = row.get("avg_spo2", np.nan)
                spo2_val = float(spo2) if (pd.notna(spo2) and 60.0 <= spo2 <= 100.0) else np.nan

                rmssd = row.get("rms_dibi", np.nan)
                rmssd_val = float(rmssd) if (pd.notna(rmssd) and 0.0 < rmssd < 500.0) else np.nan

                pnn50 = row.get("pnn50", np.nan)
                pnn50_val = float(pnn50) if (pd.notna(pnn50) and 0.0 <= pnn50 <= 100.0) else np.nan

                lf = row.get("lf", np.nan)
                hf = row.get("hf", np.nan)
                lf_val = float(lf) if pd.notna(lf) else np.nan
                hf_val = float(hf) if pd.notna(hf) else np.nan
                lf_hf_ratio = (lf_val / hf_val) if (pd.notna(lf_val) and pd.notna(hf_val) and hf_val > 0) else np.nan

                step = row.get("current_step", row.get("avg_step", np.nan))
                step_val = float(step) if pd.notna(step) else np.nan

                uncertainty = row.get("uncertainty", np.nan)
                quality = 0.8
                if pd.notna(uncertainty):
                    quality = float(np.clip(1.0 - (float(uncertainty) / 2.0), 0.2, 0.95))

                all_records.append({
                    "record_id": record_id,
                    "source_dataset": "EPA",
                    "participant_id": part_id,
                    "session_id": session_id,
                    "timestamp_min": t_min,

                    "age_yrs": np.nan,
                    "sex": np.nan,
                    "body_mass_kg": np.nan,
                    "height_cm": np.nan,
                    "bmi_kg_m2": np.nan,
                    "body_fat_pct": np.nan,
                    "vo2peak_ml_kg_min": np.nan,
                    "acclimation_status": np.nan,
                    "training_status": np.nan,

                    "air_temp_C": np.nan,
                    "relative_humidity_pct": np.nan,
                    "wind_speed_m_s": np.nan,
                    "solar_radiation_W_m2": 0.0,
                    "clothing_type": "heavy_ppe",
                    "clothing_clo": 1.3,

                    "under_clothing_temp_C": np.nan,
                    "under_clothing_rh_pct": np.nan,

                    "core_temp_C": core_val,
                    "heart_rate_bpm": hr_val,
                    "breathing_rate_bpm": resp_val,
                    "skin_temp_mean_C": np.nan,
                    "skin_temp_abdomen_C": np.nan,
                    "skin_temp_chest_C": np.nan,
                    "skin_temp_calf_C": np.nan,
                    "spo2_pct": spo2_val,
                    "steps_per_min": step_val,

                    "hrv_rmssd_ms": rmssd_val,
                    "hrv_pnn50_pct": pnn50_val,
                    "hrv_lf_power": lf_val,
                    "hrv_hf_power": hf_val,
                    "hrv_lf_hf_ratio": lf_hf_ratio,

                    "body_mass_pre_kg": np.nan,
                    "body_mass_post_kg": np.nan,
                    "total_body_water_pre_L": np.nan,
                    "total_body_water_post_L": np.nan,
                    "sweat_production_L": np.nan,

                    "activity_code": 1.0 if (pd.notna(step_val) and step_val > 10) else 0.0,
                    "work_duration_min": t_min,
                    "treadmill_speed_km_h": np.nan,
                    "treadmill_gradient_pct": np.nan,
                    "rpe": np.nan,

                    "core_temp_target_C": core_val,
                    "pwc_loss_pct": np.nan,
                    "body_mass_change_pct": np.nan,

                    "measurement_quality": quality,
                    "data_provenance": "estimated",
                })

        return pd.DataFrame(all_records)
