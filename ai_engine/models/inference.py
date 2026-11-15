"""ThermoSense AI Unified Model Inference & Occupational Safety Service.

Integrates the multi-model architecture:
- Model A: Core temperature estimation & physiological heat strain
- Model B: Environmental heat-risk & Physical Work Capacity (PWC) loss %
- Model C: Hydration deficit & fluid-loss indicator
- Model D: Conformal prediction intervals & dynamic sensor reliability
- Safety Rules Engine: 4 core heat-health concerns & emergency escalation
"""

import os
import json
from typing import Dict, Any, Optional, Union
import numpy as np
import pandas as pd
import xgboost as xgb

from ai_engine.uncertainty.conformal import ConformalUncertaintyEngine
from ai_engine.safety_rules import SafetyAlertEngine

class ThermoSensePredictor:
    """Production predictor wrapper for ThermoSense AI models."""

    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir is None:
            artifacts_dir = os.path.join(os.path.dirname(__file__), "artifacts")
        self.artifacts_dir = artifacts_dir

        self.model_a_path = os.path.join(self.artifacts_dir, "model_a_core_temp.json")
        self.model_a_meta_path = os.path.join(self.artifacts_dir, "model_a_metadata.json")

        self.model_b_path = os.path.join(self.artifacts_dir, "model_b_pwc_loss.json")
        self.model_b_meta_path = os.path.join(self.artifacts_dir, "model_b_metadata.json")

        self.model_a = None
        self.model_a_features = []
        self.model_b = None
        self.model_b_features = []

        self.uncertainty_engine = ConformalUncertaintyEngine(artifacts_dir=self.artifacts_dir)
        self.safety_engine = SafetyAlertEngine()

        self._load_models()

    def _load_models(self):
        """Loads XGBoost model artifacts and feature definitions."""
        if os.path.exists(self.model_a_path) and os.path.exists(self.model_a_meta_path):
            self.model_a = xgb.XGBRegressor()
            self.model_a.load_model(self.model_a_path)
            with open(self.model_a_meta_path, "r") as f:
                meta_a = json.load(f)
                self.model_a_features = meta_a.get("feature_list", [])

        if os.path.exists(self.model_b_path) and os.path.exists(self.model_b_meta_path):
            self.model_b = xgb.XGBRegressor()
            self.model_b.load_model(self.model_b_path)
            with open(self.model_b_meta_path, "r") as f:
                meta_b = json.load(f)
                self.model_b_features = meta_b.get("feature_list", [])

    def predict_heat_strain(
        self,
        data: Union[Dict[str, Any], pd.DataFrame],
        confidence_level: float = 0.90
    ) -> Dict[str, Any]:
        """Estimates core body temperature, conformal bounds, and safety strain level."""
        if self.model_a is None:
            raise RuntimeError("Model A is not loaded.")

        df = pd.DataFrame([data]) if isinstance(data, dict) else data.copy()
        raw_dict = data if isinstance(data, dict) else df.iloc[0].to_dict()

        # Build feature vector matching model expectations
        X = pd.DataFrame(index=df.index)
        for col in self.model_a_features:
            if col in df.columns:
                X[col] = pd.to_numeric(df[col], errors="coerce")
            else:
                X[col] = np.nan

        pred_temp = float(self.model_a.predict(X)[0])

        # Model D: Conformal prediction interval & sensor confidence
        interval_info = self.uncertainty_engine.get_core_temp_interval(
            point_estimate_C=pred_temp,
            features=raw_dict,
            confidence_level=confidence_level,
        )

        # Safety Rules Engine: Heat Strain & Stroke evaluation
        safety_eval = self.safety_engine.evaluate_all(
            core_temp_estimate=interval_info,
            telemetry=raw_dict,
        )

        return {
            "core_temp": interval_info,
            "safety_status": safety_eval["overall_safety_status"],
            "emergency_escalation": safety_eval["emergency_escalation_required"],
            "heat_strain_details": safety_eval["heat_strain"],
            "heat_stroke_details": safety_eval["heat_stroke_risk"],
            "heat_syncope_details": safety_eval["heat_syncope_risk"],
            "active_alerts": safety_eval["active_alerts"],
            "data_provenance": "estimated",
        }

    def predict_pwc_loss(
        self,
        data: Union[Dict[str, Any], pd.DataFrame],
        confidence_level: float = 0.90
    ) -> Dict[str, Any]:
        """Estimates Physical Work Capacity loss % and uncertainty interval."""
        if self.model_b is None:
            raise RuntimeError("Model B is not loaded.")

        df = pd.DataFrame([data]) if isinstance(data, dict) else data.copy()
        raw_dict = data if isinstance(data, dict) else df.iloc[0].to_dict()

        X = pd.DataFrame(index=df.index)
        for col in self.model_b_features:
            if col in df.columns:
                X[col] = pd.to_numeric(df[col], errors="coerce")
            else:
                X[col] = np.nan

        pwc_loss = float(np.clip(self.model_b.predict(X)[0], 0.0, 100.0))

        interval_info = self.uncertainty_engine.get_pwc_loss_interval(
            point_estimate_pct=pwc_loss,
            features=raw_dict,
            confidence_level=confidence_level,
        )

        if pwc_loss < 10.0:
            risk = "Low Risk"
            work_rest = "Standard schedule (50 min work / 10 min rest)"
        elif pwc_loss < 25.0:
            risk = "Moderate Risk"
            work_rest = "40 min work / 20 min rest"
        elif pwc_loss < 40.0:
            risk = "High Risk"
            work_rest = "30 min work / 30 min rest"
        else:
            risk = "Extreme Risk"
            work_rest = "Cease strenuous outdoor tasks or limit to 15 min work / 45 min cooling rest"

        return {
            "pwc_loss": interval_info,
            "environmental_risk_level": risk,
            "recommended_work_rest_ratio": work_rest,
            "data_provenance": "estimated",
        }

    def calculate_hydration_status(
        self,
        mass_pre_kg: float,
        mass_post_kg: float,
        duration_min: float = 60.0
    ) -> Dict[str, Any]:
        """Model C: Calculates body mass loss %, fluid deficit, and dehydration severity."""
        if mass_pre_kg <= 0 or mass_post_kg <= 0:
            raise ValueError("Pre and post exposure mass must be positive numbers.")

        mass_loss_kg = max(0.0, mass_pre_kg - mass_post_kg)
        loss_pct = (mass_loss_kg / mass_pre_kg) * 100.0
        duration_hr = max(0.1, duration_min / 60.0)
        rate_kg_hr = mass_loss_kg / duration_hr

        # Clinical hydration risk stratification
        if loss_pct < 1.0:
            status = "Well Hydrated / Minimal Deficit"
            advice = "Replace fluid as tolerated (250-500 ml/hr)."
        elif loss_pct < 2.0:
            status = "Mild Dehydration (<2% Body Mass)"
            advice = "Target 1.5x fluid replacement of lost mass with electrolytes."
        elif loss_pct < 3.0:
            status = "Moderate Dehydration (2-3% Body Mass)"
            advice = "Noticeable aerobic & cognitive decrement. Active rehydration mandatory."
        else:
            status = "Severe Dehydration (>3% Body Mass)"
            advice = "High cardiovascular strain risk. Medical evaluation and controlled fluid replenishment."

        return {
            "body_mass_loss_pct": round(loss_pct, 2),
            "fluid_loss_liters": round(mass_loss_kg, 2),
            "loss_rate_L_hr": round(rate_kg_hr, 2),
            "hydration_status": status,
            "recommended_hydration": advice,
            "data_provenance": "derived",
        }
