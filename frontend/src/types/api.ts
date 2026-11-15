/**
 * ThermoSense AI Type Definitions
 * Exact alignment with Backend FastAPI Schemas & DB Models
 */

export interface ConformalInterval {
  point_estimate_C: number;
  lower_bound_C: number;
  upper_bound_C: number;
  confidence_level: number;
  half_width_C: number;
  sensor_quality_score: number;
  confidence_tier: string;
}

export interface StrainDetails {
  strain_code: string;
  strain_label: string;
  description: string;
  work_rest_recommendation: string;
  recommended_action: string;
}

export interface AlertBannerItem {
  severity: string;
  title: string;
  message: string;
}

export interface TelemetryEvaluationResponse {
  core_temp: ConformalInterval;
  safety_status: 'GREEN' | 'AMBER' | 'ORANGE' | 'RED' | 'EMERGENCY_PURPLE';
  emergency_escalation: boolean;
  heat_strain_details: StrainDetails;
  heat_stroke_details: Record<string, any>;
  heat_syncope_details: Record<string, any>;
  active_alerts: AlertBannerItem[];
  data_provenance: string;
}

export interface EnvironmentalRiskRequest {
  air_temp_C: number;
  relative_humidity_pct: number;
  wind_speed_m_s?: number;
  solar_radiation_W_m2?: number;
  clothing_clo?: number;
  work_duration_min?: number;
  age_yrs?: number;
  body_mass_kg?: number;
  acclimated?: boolean;
}

export interface EnvironmentalRiskResponse {
  pwc_loss: {
    point_estimate_pct: number;
    lower_bound_pct: number;
    upper_bound_pct: number;
    confidence_level: number;
    half_width_pct: number;
  };
  environmental_risk_level: string;
  recommended_work_rest_ratio: string;
  heat_index_C?: number;
  wbgt_estimated_C?: number;
  data_provenance: string;
}

export interface HydrationCheckRequest {
  pre_mass_kg: number;
  post_mass_kg: number;
  work_duration_min: number;
  session_id?: string;
}

export interface HydrationResponse {
  body_mass_loss_pct: number;
  fluid_loss_liters: number;
  loss_rate_L_hr: number;
  hydration_status: string;
  recommended_hydration: string;
  data_provenance: string;
}

export interface Worker {
  id: string;
  external_id: string;
  full_name: string;
  age_yrs: number;
  sex: string;
  body_mass_kg: number;
  height_cm: number;
  bmi?: number;
  acclimation_status: number;
  created_at: string;
}

export interface SafetyAlert {
  id: string;
  session_id: string;
  timestamp: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  action_required?: string;
  acknowledged: boolean;
}

export interface SystemHealth {
  status: string;
  database: string;
  model_a_loaded: boolean;
  model_b_loaded: boolean;
  uptime_seconds: number;
}
