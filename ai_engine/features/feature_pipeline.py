"""Feature Engineering Pipeline for ThermoSense AI.

Transforms raw canonical observations into an expanded ~80-feature representation
by executing scientifically grounded physiological, temporal, environmental,
and individual normalization feature transforms.
"""

from typing import List, Optional
import numpy as np
import pandas as pd

class FeaturePipeline:
    """Extracts temporal, physiological, environmental, and normalization features."""

    def __init__(self):
        self.rolling_windows_mean = [5, 10, 15, 30]
        self.rolling_windows_std_max = [5, 10, 15]
        self.temporal_signals = [
            "core_temp_C",
            "heart_rate_bpm",
            "skin_temp_mean_C",
            "breathing_rate_bpm",
            "under_clothing_temp_C",
        ]

    def compute_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes rolling window statistics, derivatives, and baseline deviations per session."""
        df_out = df.copy()

        # Ensure sorted by session and timestamp
        df_out = df_out.sort_values(["session_id", "timestamp_min"]).reset_index(drop=True)

        for sig in self.temporal_signals:
            if sig not in df_out.columns:
                continue

            # Group by session_id to prevent bleeding across sessions
            grouped = df_out.groupby("session_id")[sig]

            # 1. Rolling means
            for w in self.rolling_windows_mean:
                col_name = f"{sig}_rolling_mean_{w}m"
                df_out[col_name] = grouped.transform(lambda s: s.rolling(window=w, min_periods=1).mean())

            # 2. Rolling std & max
            for w in self.rolling_windows_std_max:
                col_std = f"{sig}_rolling_std_{w}m"
                col_max = f"{sig}_rolling_max_{w}m"
                df_out[col_std] = grouped.transform(lambda s: s.rolling(window=w, min_periods=1).std().fillna(0.0))
                df_out[col_max] = grouped.transform(lambda s: s.rolling(window=w, min_periods=1).max())

            # 3. Rate of change (first derivative) per minute
            def calc_roc(s):
                diff = s.diff()
                return diff.fillna(0.0)

            col_roc = f"{sig}_rate_of_change"
            df_out[col_roc] = grouped.transform(calc_roc)

            # 4. Acceleration (second derivative)
            col_acc = f"{sig}_acceleration"
            df_out[col_acc] = df_out.groupby("session_id")[col_roc].transform(lambda s: s.diff().fillna(0.0))

            # 5. Deviation from baseline (first 10 min mean)
            def calc_dev_baseline(s):
                baseline = s.iloc[:10].mean() if len(s) >= 1 else np.nan
                if pd.isna(baseline):
                    baseline = s.mean()
                return s - baseline

            col_dev = f"{sig}_deviation_from_baseline"
            df_out[col_dev] = grouped.transform(calc_dev_baseline)

        # Cumulative heat exposure (minutes with T_core > 38.0 or HR > 120)
        if "core_temp_C" in df_out.columns:
            df_out["cumulative_hyperthermia_min"] = df_out.groupby("session_id")["core_temp_C"].transform(
                lambda s: (s >= 38.0).astype(float).cumsum()
            )
        else:
            df_out["cumulative_hyperthermia_min"] = 0.0

        if "heart_rate_bpm" in df_out.columns:
            df_out["cumulative_cardiac_strain_min"] = df_out.groupby("session_id")["heart_rate_bpm"].transform(
                lambda s: (s >= 120.0).astype(float).cumsum()
            )
        else:
            df_out["cumulative_cardiac_strain_min"] = 0.0

        return df_out

    def compute_physiological_interactions(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes multi-signal physiological interaction and thermoregulatory metrics."""
        df_out = df.copy()

        # 1. Core-to-skin gradient: T_core - T_skin (heat dissipation potential)
        df_out["core_skin_gradient"] = df_out["core_temp_C"] - df_out["skin_temp_mean_C"]

        # Gradient change rate
        df_out["core_skin_gradient_change"] = df_out.groupby("session_id")["core_skin_gradient"].transform(
            lambda s: s.diff().fillna(0.0)
        )

        # 2. HR per degree core temp change
        delta_hr = df_out["heart_rate_bpm_rate_of_change"] if "heart_rate_bpm_rate_of_change" in df_out.columns else 0.0
        delta_core = df_out["core_temp_C_rate_of_change"] if "core_temp_C_rate_of_change" in df_out.columns else 0.0
        df_out["HR_per_degree_core"] = np.where(
            np.abs(delta_core) > 0.01,
            delta_hr / np.where(delta_core == 0, 1e-5, delta_core),
            0.0
        )
        df_out["HR_per_degree_core"] = np.clip(df_out["HR_per_degree_core"], -100.0, 100.0)

        # 3. Moran Physiological Strain Index (PSI): 0 to 10 scale
        # PSI = 5 * (T_core_t - T_core_0)/(39.5 - T_core_0) + 5 * (HR_t - HR_0)/(180 - HR_0)
        t0 = df_out.groupby("session_id")["core_temp_C"].transform("first").fillna(37.0).clip(35.0, 38.0)
        hr0 = df_out.groupby("session_id")["heart_rate_bpm"].transform("first").fillna(70.0).clip(45.0, 100.0)
        t_term = 5.0 * (df_out["core_temp_C"].fillna(37.0) - t0) / np.maximum(0.5, 39.5 - t0)
        hr_term = 5.0 * (df_out["heart_rate_bpm"].fillna(70.0) - hr0) / np.maximum(20.0, 180.0 - hr0)
        df_out["physiological_strain_index"] = np.clip(t_term + hr_term, 0.0, 10.0)

        # 4. Cumulative heat storage: integral of (T_core - 37.0)
        df_out["cumulative_heat_storage"] = df_out.groupby("session_id")["core_temp_C"].transform(
            lambda s: np.maximum(0.0, s - 37.0).cumsum()
        )

        # 5. Cardiovascular efficiency: HR / (workload + 1)
        act = df_out["activity_code"].fillna(1.0)
        df_out["HR_efficiency_ratio"] = df_out["heart_rate_bpm"] / (act + 1.0)

        # 6. Peripheral skin gradient range (chest vs calf if available)
        chest = df_out["skin_temp_chest_C"]
        calf = df_out["skin_temp_calf_C"]
        df_out["skin_gradient_range"] = np.where(
            chest.notna() & calf.notna(),
            chest - calf,
            np.nan
        )

        # 7. Cardiorespiratory coupling: BR / HR
        br = df_out["breathing_rate_bpm"]
        hr = df_out["heart_rate_bpm"]
        df_out["breathing_HR_ratio"] = np.where(
            br.notna() & hr.notna() & (hr > 0),
            br / hr,
            np.nan
        )

        return df_out

    def compute_environmental_composites(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes Heat Index, vapor pressure, WBGT estimate, and environmental risk category."""
        df_out = df.copy()

        t_c = df_out["air_temp_C"].fillna(25.0)
        rh = df_out["relative_humidity_pct"].fillna(50.0)
        wind = df_out["wind_speed_m_s"].fillna(0.2)
        solar = df_out["solar_radiation_W_m2"].fillna(0.0)
        clo = df_out["clothing_clo"].fillna(0.6)

        # 1. Heat Index via Rothfusz regression (in °C)
        t_f = t_c * 9.0 / 5.0 + 32.0
        hi_f = (
            -42.379
            + 2.04901523 * t_f
            + 10.14333127 * rh
            - 0.22475541 * t_f * rh
            - 0.00683783 * (t_f ** 2)
            - 0.05481717 * (rh ** 2)
            + 0.00122874 * (t_f ** 2) * rh
            + 0.00085282 * t_f * (rh ** 2)
            - 0.00000199 * (t_f ** 2) * (rh ** 2)
        )
        # Convert back to °C; apply simple formula for cooler temps
        hi_c = (hi_f - 32.0) * 5.0 / 9.0
        df_out["heat_index_C"] = np.where(t_c < 20.0, t_c, hi_c)

        # 2. Vapor pressure (hPa) - Buck/Tetens formula
        vp = (rh / 100.0) * 6.1121 * np.exp((18.678 - (t_c / 234.5)) * (t_c / (257.14 + t_c)))
        df_out["vapor_pressure_hpa"] = vp

        # 3. Estimated WBGT (Liljegren / Australian approximation)
        # Simplified: WBGT ~ 0.567*Ta + 0.393*vp + 3.94
        wbgt_simple = 0.567 * t_c + 0.393 * (vp / 1.0) + 3.94 + 0.005 * solar - 0.5 * np.sqrt(np.maximum(0.1, wind))
        df_out["WBGT_estimated_C"] = wbgt_simple

        # 4. Evaporative cooling potential: capacity of environment to evaporate sweat through clothing
        # Lower when RH/VP is high and clothing insulation (clo) is high
        vp_skin = 56.2 # saturated vapor pressure at skin ~35°C is ~56 hPa
        vp_deficit = np.maximum(0.0, vp_skin - vp)
        evap_pot = (vp_deficit * (1.0 + 0.3 * np.sqrt(wind))) / (clo + 0.1)
        df_out["evaporative_cooling_potential"] = evap_pot

        # 5. Solar clothing interaction: radiant heat absorbed
        df_out["solar_clothing_interaction"] = solar * clo

        # 6. Thermal load index (Composite environmental stress)
        df_out["thermal_load_index"] = (
            t_c
            + 0.5 * (rh / 10.0)
            - 1.5 * np.sqrt(np.maximum(0.0, wind))
            + 0.008 * solar
            + 3.0 * (clo - 0.6)
        )

        # 7. Environmental risk category: 0=Low, 1=Moderate, 2=High, 3=Extreme
        tli = df_out["thermal_load_index"]
        env_cat = np.zeros(len(df_out), dtype=float)
        env_cat[tli >= 28.0] = 1.0
        env_cat[tli >= 34.0] = 2.0
        env_cat[tli >= 40.0] = 3.0
        df_out["env_risk_category"] = env_cat

        return df_out

    def compute_participant_normalizations(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes age-normalized heart rate, cardiac reserve, and individual z-scores."""
        df_out = df.copy()

        age = df_out["age_yrs"].fillna(32.0)
        hr_max = 220.0 - age
        df_out["HR_max_estimated"] = hr_max

        hr = df_out["heart_rate_bpm"]
        df_out["HR_pct_of_max"] = np.where(
            hr.notna(),
            (hr / hr_max) * 100.0,
            np.nan
        )

        # Resting HR estimate (minimum of first 5 min or default 65 bpm)
        def get_rest_hr(s):
            m = s.iloc[:5].min() if len(s) >= 1 else 65.0
            return m if (pd.notna(m) and 40 <= m <= 95) else 65.0

        resting_hr = df_out.groupby("session_id")["heart_rate_bpm"].transform(get_rest_hr)
        hr_reserve = np.maximum(20.0, hr_max - resting_hr)
        df_out["HR_reserve_used_pct"] = np.where(
            hr.notna(),
            np.clip((hr - resting_hr) / hr_reserve * 100.0, 0.0, 120.0),
            np.nan
        )

        # Individual normalized Core temp z-score
        def calc_zscore(s):
            mean_val = s.mean()
            std_val = s.std()
            if pd.isna(std_val) or std_val < 0.05:
                return pd.Series(0.0, index=s.index)
            return (s - mean_val) / std_val

        df_out["core_temp_z_score"] = df_out.groupby("participant_id")["core_temp_C"].transform(calc_zscore)

        # BMI Risk Factor: 0 (<25), 1 (25-30), 2 (>=30)
        bmi = df_out["bmi_kg_m2"]
        bmi_risk = np.zeros(len(df_out), dtype=float)
        bmi_risk[(bmi >= 25.0) & (bmi < 30.0)] = 1.0
        bmi_risk[bmi >= 30.0] = 2.0
        bmi_risk[bmi.isna()] = np.nan
        df_out["BMI_risk_factor"] = bmi_risk

        # Fitness factor (VO2peak normalized to 0-1 range based on population 20-75 ml/kg/min)
        vo2 = df_out["vo2peak_ml_kg_min"]
        df_out["fitness_factor"] = np.where(
            vo2.notna(),
            np.clip((vo2 - 20.0) / 55.0, 0.0, 1.0),
            np.nan
        )

        # Acclimation factor (already 0, 1, 2)
        df_out["acclimation_factor"] = df_out["acclimation_status"].fillna(0.0)

        return df_out

    def compute_hydration_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes body mass changes, water loss rates, and dehydration risk indicators."""
        df_out = df.copy()

        m_pre = df_out["body_mass_pre_kg"]
        m_post = df_out["body_mass_post_kg"]
        tbw_pre = df_out["total_body_water_pre_L"]
        tbw_post = df_out["total_body_water_post_L"]
        dur = df_out["work_duration_min"].fillna(40.0)

        # Body mass change %
        m_change_pct = np.where(
            m_pre.notna() & m_post.notna() & (m_pre > 0),
            ((m_pre - m_post) / m_pre) * 100.0,
            df_out["body_mass_change_pct"]
        )
        df_out["body_mass_change_pct"] = m_change_pct

        # Total body water change %
        df_out["total_body_water_change_pct"] = np.where(
            tbw_pre.notna() & tbw_post.notna() & (tbw_pre > 0),
            ((tbw_pre - tbw_post) / tbw_pre) * 100.0,
            np.nan
        )

        # Mass loss rate (kg/hr)
        dur_hr = np.maximum(0.2, dur / 60.0)
        df_out["mass_loss_rate_kg_hr"] = np.where(
            m_pre.notna() & m_post.notna(),
            np.maximum(0.0, m_pre - m_post) / dur_hr,
            np.nan
        )

        # Estimated sweat rate from sweat_production_L or mass loss
        sweat_l = df_out["sweat_production_L"]
        df_out["sweat_rate_estimated_L_hr"] = np.where(
            sweat_l.notna(),
            sweat_l / dur_hr,
            df_out["mass_loss_rate_kg_hr"]
        )

        # Dehydration risk score: 0 to 10 scale
        # 1% mass loss = 2.5 pts, 2% = 5.0 pts, 3% = 7.5 pts, 4% = 10 pts
        # Adjusted by cumulative heat exposure and HR
        loss_score = np.nan_to_num(m_change_pct, nan=0.0) * 2.5
        heat_adj = np.nan_to_num(df_out.get("cumulative_hyperthermia_min", 0.0), nan=0.0) * 0.05
        df_out["dehydration_risk_score"] = np.clip(loss_score + heat_adj, 0.0, 10.0)

        return df_out

    def compute_quality_meta_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Computes data quality scores, missingness ratios, and freshness tracking."""
        df_out = df.copy()

        key_signals = ["core_temp_C", "heart_rate_bpm", "skin_temp_mean_C", "air_temp_C", "relative_humidity_pct"]
        df_out["missing_ratio"] = df_out[key_signals].isna().mean(axis=1)

        # Signal quality score
        base_qual = df_out["measurement_quality"].fillna(0.7)
        df_out["signal_quality_score"] = np.clip(base_qual * (1.0 - 0.5 * df_out["missing_ratio"]), 0.1, 1.0)

        # Time since last valid heart rate reading
        def calc_time_since_valid(s):
            valid_mask = s.notna()
            time_since = []
            last_t = 0
            for idx, (is_valid, t) in enumerate(zip(valid_mask, range(len(s)))):
                if is_valid:
                    last_t = t
                time_since.append(float(t - last_t))
            return pd.Series(time_since, index=s.index)

        df_out["time_since_last_valid_min"] = df_out.groupby("session_id")["heart_rate_bpm"].transform(calc_time_since_valid)

        return df_out

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Runs the complete 6-stage feature engineering pipeline."""
        print(f"Executing FeaturePipeline on {len(df)} rows...")
        
        df = self.compute_temporal_features(df)
        print(" -> Stage 1/6: Temporal features computed.")
        
        df = self.compute_physiological_interactions(df)
        print(" -> Stage 2/6: Physiological interaction features computed.")
        
        df = self.compute_environmental_composites(df)
        print(" -> Stage 3/6: Environmental composite features computed.")
        
        df = self.compute_participant_normalizations(df)
        print(" -> Stage 4/6: Participant normalization features computed.")
        
        df = self.compute_hydration_features(df)
        print(" -> Stage 5/6: Hydration features computed.")
        
        df = self.compute_quality_meta_features(df)
        print(" -> Stage 6/6: Quality meta-features computed.")
        
        print(f"FeaturePipeline complete! Total columns: {len(df.columns)}")
        return df
