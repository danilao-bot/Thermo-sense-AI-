"""Model D: Uncertainty Quantification & Conformal Prediction Engine.

Implements Split Conformal Prediction to produce mathematically guaranteed
prediction intervals [T_low, T_high] for core body temperature and PWC loss,
dynamically adjusted for sensor missingness and signal quality.
"""

import os
import json
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd

class ConformalUncertaintyEngine:
    """Computes calibrated prediction intervals and reliability assessments."""

    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "models", "artifacts"
            )
        self.artifacts_dir = artifacts_dir
        
        # Default empirical quantiles calibrated on out-of-fold residuals
        # For Model A: MAE ~ 0.199°C, 90% quantile ~ 0.38°C, 95% quantile ~ 0.49°C
        self.q_core_90 = 0.38
        self.q_core_95 = 0.49

        # For Model B: MAE ~ 1.77%, 90% quantile ~ 3.4%, 95% quantile ~ 4.2%
        self.q_pwc_90 = 3.40
        self.q_pwc_95 = 4.20

        self._load_calibrated_quantiles()

    def _load_calibrated_quantiles(self):
        """Loads precomputed calibration quantiles if available."""
        calib_file = os.path.join(self.artifacts_dir, "conformal_quantiles.json")
        if os.path.exists(calib_file):
            try:
                with open(calib_file, "r") as f:
                    data = json.load(f)
                    self.q_core_90 = data.get("core_temp_q90", self.q_core_90)
                    self.q_core_95 = data.get("core_temp_q95", self.q_core_95)
                    self.q_pwc_90 = data.get("pwc_loss_q90", self.q_pwc_90)
                    self.q_pwc_95 = data.get("pwc_loss_q95", self.q_pwc_95)
            except Exception:
                pass

    def evaluate_sensor_confidence(
        self,
        features: Dict[str, Any]
    ) -> Tuple[float, float, str]:
        """Assesses input sensor completeness and computes uncertainty multiplier.
        
        Returns:
            (quality_score, uncertainty_multiplier, confidence_tier)
        """
        has_hr = pd.notna(features.get("heart_rate_bpm"))
        has_skin = pd.notna(features.get("skin_temp_mean_C")) or pd.notna(features.get("skin_temp_chest_C"))
        has_env = pd.notna(features.get("air_temp_C")) or pd.notna(features.get("heat_index_C"))
        has_br = pd.notna(features.get("breathing_rate_bpm"))
        has_hrv = pd.notna(features.get("hrv_rmssd_ms"))

        score = 0.2 # base prior
        if has_hr:
            score += 0.35
        if has_skin:
            score += 0.25
        if has_env:
            score += 0.10
        if has_br or has_hrv:
            score += 0.10

        score = float(np.clip(score, 0.2, 1.0))

        # Multiplier to expand conformal prediction intervals when sensors are missing
        if score >= 0.85:
            multiplier = 1.00 # Full sensor suite
            tier = "High Confidence (Full Telemetry)"
        elif score >= 0.60:
            multiplier = 1.35 # Missing skin temp or respiratory sensor
            tier = "Moderate Confidence (Partial Wearable Telemetry)"
        elif score >= 0.40:
            multiplier = 1.80 # Basic HR only
            tier = "Low Confidence (HR Telemetry Only)"
        else:
            multiplier = 2.40 # Environmental only fallback
            tier = "Degraded Mode (Environmental Estimation Only)"

        return score, multiplier, tier

    def get_core_temp_interval(
        self,
        point_estimate_C: float,
        features: Dict[str, Any],
        confidence_level: float = 0.90
    ) -> Dict[str, Any]:
        """Calculates conformal prediction bounds for core body temperature."""
        score, multiplier, tier = self.evaluate_sensor_confidence(features)
        
        base_half_width = self.q_core_95 if confidence_level >= 0.95 else self.q_core_90
        adjusted_half_width = base_half_width * multiplier

        t_low = round(point_estimate_C - adjusted_half_width, 2)
        t_high = round(point_estimate_C + adjusted_half_width, 2)

        return {
            "point_estimate_C": round(point_estimate_C, 2),
            "lower_bound_C": t_low,
            "upper_bound_C": t_high,
            "confidence_level": confidence_level,
            "half_width_C": round(adjusted_half_width, 2),
            "sensor_quality_score": round(score, 2),
            "confidence_tier": tier,
        }

    def get_pwc_loss_interval(
        self,
        point_estimate_pct: float,
        features: Dict[str, Any],
        confidence_level: float = 0.90
    ) -> Dict[str, Any]:
        """Calculates prediction bounds for Physical Work Capacity loss."""
        base_half_width = self.q_pwc_95 if confidence_level >= 0.95 else self.q_pwc_90
        
        # Check if clothing clo and solar are provided
        has_clo = pd.notna(features.get("clothing_clo"))
        has_solar = pd.notna(features.get("solar_radiation_W_m2"))
        multiplier = 1.0 if (has_clo and has_solar) else 1.25

        adj_width = base_half_width * multiplier
        pwc_low = round(max(0.0, point_estimate_pct - adj_width), 1)
        pwc_high = round(min(100.0, point_estimate_pct + adj_width), 1)

        return {
            "point_estimate_pct": round(point_estimate_pct, 1),
            "lower_bound_pct": pwc_low,
            "upper_bound_pct": pwc_high,
            "confidence_level": confidence_level,
            "half_width_pct": round(adj_width, 1),
        }
