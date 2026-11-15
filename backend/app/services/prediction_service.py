"""Prediction Service bridging FastAPI API to the ThermoSense AI Engine."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ai_engine.models.inference import ThermoSensePredictor
from backend.app.schemas.telemetry import TelemetryInput, TelemetryEvaluationResponse
from backend.app.schemas.environmental import EnvironmentalRiskRequest, EnvironmentalRiskResponse
from backend.app.schemas.hydration import HydrationCheckRequest, HydrationResponse
from backend.app.db.models import TelemetryReadingModel, SafetyAlertModel, WorkSessionModel

class PredictionService:
    """Singleton inference broker for ThermoSense AI."""

    _predictor: Optional[ThermoSensePredictor] = None

    @classmethod
    def get_predictor(cls) -> ThermoSensePredictor:
        if cls._predictor is None:
            cls._predictor = ThermoSensePredictor()
        return cls._predictor

    @classmethod
    def evaluate_telemetry(
        cls,
        payload: TelemetryInput,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Evaluates telemetry input against Model A, Model D, and Safety Rules."""
        predictor = cls.get_predictor()
        data_dict = payload.model_dump()

        # Auto-fill rolling proxies if device only sent instantaneous metrics
        hr = data_dict.get("heart_rate_bpm")
        if hr is not None:
            if data_dict.get("heart_rate_bpm_rolling_mean_15m") is None:
                data_dict["heart_rate_bpm_rolling_mean_15m"] = hr
            if data_dict.get("heart_rate_bpm_rolling_max_15m") is None:
                data_dict["heart_rate_bpm_rolling_max_15m"] = hr

        skin = data_dict.get("skin_temp_mean_C")
        if skin is not None:
            if data_dict.get("skin_temp_mean_C_rolling_mean_15m") is None:
                data_dict["skin_temp_mean_C_rolling_mean_15m"] = skin

        result = predictor.predict_heat_strain(data_dict)

        # Optionally persist telemetry snapshot to database
        session_id = payload.session_id
        if db is not None and session_id is not None:
            sess = db.query(WorkSessionModel).filter(WorkSessionModel.id == session_id).first()
            if sess:
                reading = TelemetryReadingModel(
                    session_id=session_id,
                    timestamp_min=payload.work_duration_min,
                    heart_rate_bpm=hr,
                    skin_temp_mean_C=skin,
                    breathing_rate_bpm=payload.breathing_rate_bpm,
                    air_temp_C=payload.air_temp_C,
                    relative_humidity_pct=payload.relative_humidity_pct,
                    estimated_core_temp_C=result["core_temp"]["point_estimate_C"],
                    core_temp_lower_bound_C=result["core_temp"]["lower_bound_C"],
                    core_temp_upper_bound_C=result["core_temp"]["upper_bound_C"],
                    sensor_quality_score=result["core_temp"]["sensor_quality_score"],
                    confidence_tier=result["core_temp"]["confidence_tier"],
                    strain_zone=result["safety_status"],
                    emergency_flag=result["emergency_escalation"],
                )
                db.add(reading)

                # Persist active alerts
                for alert in result.get("active_alerts", []):
                    db_alert = SafetyAlertModel(
                        session_id=session_id,
                        alert_type="HEAT_STRAIN",
                        severity=alert["severity"],
                        title=alert["title"],
                        message=alert["message"],
                    )
                    db.add(db_alert)

                db.commit()

        return result

    @classmethod
    def evaluate_environmental(
        cls,
        payload: EnvironmentalRiskRequest
    ) -> Dict[str, Any]:
        """Evaluates environmental heat load against Model B."""
        predictor = cls.get_predictor()
        data_dict = payload.model_dump()
        result = predictor.predict_pwc_loss(data_dict)

        # Also attach heat index and estimated WBGT
        t_c = payload.air_temp_C
        rh = payload.relative_humidity_pct
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
        hi_c = round((hi_f - 32.0) * 5.0 / 9.0, 1)

        result["heat_index_C"] = hi_c
        return result

    @classmethod
    def calculate_hydration(
        cls,
        payload: HydrationCheckRequest
    ) -> Dict[str, Any]:
        """Evaluates fluid loss and replacement via Model C."""
        predictor = cls.get_predictor()
        return predictor.calculate_hydration_status(
            mass_pre_kg=payload.pre_mass_kg,
            mass_post_kg=payload.post_mass_kg,
            duration_min=payload.work_duration_min,
        )
