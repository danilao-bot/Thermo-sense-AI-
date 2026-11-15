"""Occupational Heat-Health Safety Rules and Alert Engine.

Implements rule-based occupational safety logic for the four core concerns:
1. Physiological Heat Strain (Continuous Zones)
2. Dehydration Risk (Fluid-balance indicators & replacement schedule)
3. Heat Syncope Risk (Conservative postural warning, not diagnosed)
4. Heat Stroke Emergency Escalation (Immediate active cooling & medical triage)
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

class SafetyAlertEngine:
    """Evaluates multi-modal physiological and environmental indicators against safety standards."""

    # Thermal Strain thresholds (°C)
    TEMP_NORMAL = 37.5
    TEMP_MILD = 38.0
    TEMP_MODERATE = 38.5
    TEMP_HIGH = 39.0
    TEMP_HEAT_STROKE_CRITICAL = 39.5

    # Heart Rate thresholds (bpm)
    HR_MILD = 110.0
    HR_MODERATE = 130.0
    HR_HIGH = 155.0
    HR_CRITICAL = 175.0

    def evaluate_all(
        self,
        core_temp_estimate: Dict[str, Any],
        pwc_loss_estimate: Optional[Dict[str, Any]] = None,
        hydration_data: Optional[Dict[str, Any]] = None,
        telemetry: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Runs the complete safety rule engine across all four concerns."""
        if telemetry is None:
            telemetry = {}

        t_point = core_temp_estimate.get("point_estimate_C", 37.0)
        t_high = core_temp_estimate.get("upper_bound_C", t_point)
        hr = telemetry.get("heart_rate_bpm", np.nan)
        hr_drop = telemetry.get("heart_rate_bpm_rate_of_change", 0.0)
        duration_min = telemetry.get("work_duration_min", 30.0)
        air_temp = telemetry.get("air_temp_C", 25.0)

        # 1. Heat Strain Zone Evaluation
        strain_result = self._evaluate_heat_strain(t_point, t_high, hr)

        # 2. Heat Stroke Emergency Escalation
        stroke_result = self._evaluate_heat_stroke_escalation(t_point, t_high, telemetry)

        # 3. Heat Syncope Postural Warning
        syncope_result = self._evaluate_heat_syncope_warning(t_point, hr, hr_drop, duration_min)

        # 4. Dehydration & Fluid Replenishment
        hydration_result = self._evaluate_hydration_guidance(hydration_data, air_temp, duration_min)

        # Aggregate highest severity level
        severity_levels = ["GREEN", "AMBER", "ORANGE", "RED", "EMERGENCY_PURPLE"]
        current_level = strain_result["strain_code"]
        if stroke_result["emergency_escalation"]:
            current_level = "EMERGENCY_PURPLE"

        return {
            "overall_safety_status": current_level,
            "emergency_escalation_required": stroke_result["emergency_escalation"],
            "heat_strain": strain_result,
            "heat_stroke_risk": stroke_result,
            "heat_syncope_risk": syncope_result,
            "hydration_status": hydration_result,
            "active_alerts": self._compile_active_alerts(
                strain_result, stroke_result, syncope_result, hydration_result
            ),
        }

    def _evaluate_heat_strain(self, t_point: float, t_high: float, hr: float) -> Dict[str, Any]:
        """Classifies physiological heat strain into occupational triage zones."""
        # Use upper conformal bound conservatively for worker safety
        effective_temp = max(t_point, t_high - 0.15)

        if effective_temp < self.TEMP_NORMAL:
            return {
                "strain_code": "GREEN",
                "strain_label": "Normal / Thermoneutral",
                "description": "Core temperature is within normal circadian resting/light work limits.",
                "work_rest_recommendation": "Standard schedule (50 min work / 10 min rest).",
                "recommended_action": "Maintain routine hydration.",
            }
        elif effective_temp < self.TEMP_MILD:
            return {
                "strain_code": "AMBER",
                "strain_label": "Mild Heat Strain",
                "description": "Early thermoregulatory activation. Skin vasodilation and sweating initiated.",
                "work_rest_recommendation": "45 min work / 15 min rest in shaded cool area.",
                "recommended_action": "Drink 250 ml water or electrolyte beverage every 20 minutes.",
            }
        elif effective_temp < self.TEMP_MODERATE:
            return {
                "strain_code": "ORANGE",
                "strain_label": "Moderate Heat Strain",
                "description": "Elevated thermal and cardiovascular load. Risk of physical fatigue and reduced vigilance.",
                "work_rest_recommendation": "30 min work / 30 min rest with fan or passive ventilation.",
                "recommended_action": "Unbutton or loosen PPE during rest. Consume chilled electrolyte drinks.",
            }
        elif effective_temp < self.TEMP_HIGH:
            return {
                "strain_code": "RED",
                "strain_label": "High Heat Strain",
                "description": "High physiological strain threshold reached. Significant cardiovascular strain.",
                "work_rest_recommendation": "Cease heavy physical exertion immediately. Minimum 45 min cooling rest.",
                "recommended_action": "Remove heavy PPE. Apply cold wet towels to neck and torso. Supervise worker.",
            }
        else:
            return {
                "strain_code": "EMERGENCY_PURPLE",
                "strain_label": "Critical Thermal Overload",
                "description": "Core temperature exceeds safe physiological ceiling. Immediate danger of cellular damage.",
                "work_rest_recommendation": "TOTAL STOP OF WORK.",
                "recommended_action": "Initiate emergency immersion / rapid cooling protocols.",
            }

    def _evaluate_heat_stroke_escalation(
        self,
        t_point: float,
        t_high: float,
        telemetry: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Detects rapid onset of hyperthermia hazard and triggers emergency escalation."""
        emergency = False
        reasons = []

        # 1. Absolute temperature threshold
        if t_high >= self.TEMP_HEAT_STROKE_CRITICAL or t_point >= self.TEMP_HIGH:
            emergency = True
            reasons.append(f"Estimated core temperature reached {t_point:.2f}°C (Upper confidence bound: {t_high:.2f}°C).")

        # 2. Rapid rate of rise (> 1.5°C/hr under exertion)
        t_roc = telemetry.get("core_temp_C_rate_of_change", 0.0)
        # 0.025°C/min = 1.5°C/hr
        if t_roc >= 0.025 and t_point >= 38.3:
            emergency = True
            reasons.append(f"Rapid thermal surge detected: +{t_roc*60:.1f}°C/hr rate of rise.")

        # 3. Severe tachycardia with hyperthermia
        hr = telemetry.get("heart_rate_bpm", np.nan)
        if pd.notna(hr) and hr >= self.HR_CRITICAL and t_point >= 38.5:
            emergency = True
            reasons.append(f"Critical cardiac overload ({hr:.0f} bpm) combined with core temp {t_point:.2f}°C.")

        if emergency:
            return {
                "emergency_escalation": True,
                "urgency": "IMMEDIATE EMERGENCY",
                "trigger_reasons": reasons,
                "protocol": [
                    "1. Call Emergency Medical Services (EMS / site medic) immediately.",
                    "2. Move patient to shaded, air-conditioned or ventilated environment.",
                    "3. Strip all heavy PPE and outerwear immediately.",
                    "4. Rapid active cooling: ice water immersion, douse with cold water and vigorously fan, or apply ice packs to axillae, groin, and neck.",
                    "5. Monitor airway, breathing, and mental status continuously.",
                ],
            }
        else:
            return {
                "emergency_escalation": False,
                "urgency": "NORMAL_MONITORING",
                "trigger_reasons": [],
                "protocol": [],
            }

    def _evaluate_heat_syncope_warning(
        self,
        t_point: float,
        hr: float,
        hr_roc: float,
        duration_min: float
    ) -> Dict[str, Any]:
        """Detects orthostatic pooling / syncope collapse risk without diagnosing."""
        # Risk criteria: prolonged exposure (>25 min) + elevated temp (>37.8°C) + sudden drop in HR
        syncope_risk = False
        notes = []

        if t_point >= 37.8 and duration_min >= 25.0:
            if hr_roc <= -15.0: # sudden drop of 15+ bpm
                syncope_risk = True
                notes.append("Sudden cardiovascular deceleration detected following prolonged heat exposure.")
            elif pd.notna(hr) and hr <= 55.0:
                syncope_risk = True
                notes.append("Unexpected bradycardia during prolonged heat exposure.")

        return {
            "syncope_warning_flag": syncope_risk,
            "advisory_type": "Conservative Postural Warning (Non-diagnostic)",
            "rationale": notes,
            "precautionary_guidance": (
                "Advise worker to avoid abrupt standing or rigid motionless posture. "
                "If feeling lightheaded, dizziness, or tunnel vision, sit down immediately with knees bent "
                "or lie flat with legs elevated 30 cm in a cool shaded area."
            ) if syncope_risk else "Standard postural resilience.",
        }

    def _evaluate_hydration_guidance(
        self,
        hydration_data: Optional[Dict[str, Any]],
        air_temp: float,
        duration_min: float
    ) -> Dict[str, Any]:
        """Provides dynamic fluid intake recommendations."""
        if hydration_data is None:
            # Baseline estimation from duration and air temperature
            base_hourly_ml = 500.0 if air_temp < 30.0 else (750.0 if air_temp < 35.0 else 1000.0)
            return {
                "measured_fluid_loss": False,
                "estimated_hourly_need_ml": base_hourly_ml,
                "replacement_protocol": f"Target drinking {int(base_hourly_ml / 4)} ml of water/electrolytes every 15 minutes.",
                "status": "Hydration schedule based on environmental exposure.",
            }
        else:
            loss_pct = hydration_data.get("body_mass_loss_pct", 0.0)
            liters_lost = hydration_data.get("fluid_loss_liters", 0.0)
            
            # Fluid replacement target: 1.5x fluid lost (to account for ongoing renal loss)
            recommended_refill_L = round(liters_lost * 1.5, 2)

            return {
                "measured_fluid_loss": True,
                "body_mass_loss_pct": loss_pct,
                "fluid_deficit_L": liters_lost,
                "total_replacement_target_L": recommended_refill_L,
                "status": hydration_data.get("hydration_status", "Calculated"),
                "replacement_protocol": (
                    f"Replace {recommended_refill_L} L of fluids with sodium/electrolyte content over the next 2-3 hours. "
                    "Avoid consuming pure water in high volumes without electrolytes."
                ),
            }

    def _compile_active_alerts(
        self,
        strain: Dict[str, Any],
        stroke: Dict[str, Any],
        syncope: Dict[str, Any],
        hydration: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Compiles clean prioritized alert banner messages."""
        alerts = []

        if stroke["emergency_escalation"]:
            alerts.append({
                "severity": "CRITICAL_EMERGENCY",
                "title": "HEAT STROKE EMERGENCY PROTOCOL TRIGGERED",
                "message": " ".join(stroke["trigger_reasons"]),
            })

        if strain["strain_code"] in ["ORANGE", "RED"]:
            alerts.append({
                "severity": "WARNING",
                "title": f"Heat Strain Alert: {strain['strain_label']}",
                "message": strain["description"],
            })

        if syncope["syncope_warning_flag"]:
            alerts.append({
                "severity": "ADVISORY",
                "title": "Postural Collapse / Syncope Precaution",
                "message": syncope["precautionary_guidance"],
            })

        if hydration.get("measured_fluid_loss") and hydration.get("body_mass_loss_pct", 0.0) >= 2.0:
            alerts.append({
                "severity": "WARNING",
                "title": "Moderate Dehydration Deficit (>2% Body Mass)",
                "message": hydration["replacement_protocol"],
            })

        return alerts
