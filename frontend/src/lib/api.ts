/**
 * ThermoSense AI API Client
 * Interacts with FastAPI backend at /api/v1
 */

import {
  TelemetryEvaluationResponse,
  EnvironmentalRiskRequest,
  EnvironmentalRiskResponse,
  HydrationCheckRequest,
  HydrationResponse,
  Worker,
  SafetyAlert,
  SystemHealth,
} from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`[Network Error] Unable to connect to backend at ${API_BASE}. Ensure FastAPI is running on port 8000: ${errorMsg}`);
  }

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errData = await res.json();
      errorDetail = errData.detail || errorDetail;
    } catch {
      // ignore non-json error responses
    }
    throw new Error(`[${res.status}] ${errorDetail}`);
  }

  return res.json();
}

export const api = {
  // Deep System Health
  getHealth: () => fetchJson<SystemHealth>('/health?detailed=true'),

  // Telemetry & Core Temp Inference (Model A + D)
  evaluateTelemetry: (payload: {
    worker_id?: string;
    session_id?: string;
    work_duration_min: number;
    heart_rate_bpm?: number;
    skin_temp_mean_C?: number;
    breathing_rate_bpm?: number;
    air_temp_C?: number;
    relative_humidity_pct?: number;
    wind_speed_m_s?: number;
    clothing_clo?: number;
  }) =>
    fetchJson<TelemetryEvaluationResponse>('/api/v1/telemetry/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Environmental Risk & Work Capacity Loss (Model B)
  evaluateEnvironmental: (payload: EnvironmentalRiskRequest) =>
    fetchJson<EnvironmentalRiskResponse>('/api/v1/environmental/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Hydration Loss & Rehydration Math (Model C)
  calculateHydration: (payload: HydrationCheckRequest) =>
    fetchJson<HydrationResponse>('/api/v1/hydration/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Workers
  listWorkers: () => fetchJson<Worker[]>('/api/v1/workers/'),
  createWorker: (worker: Omit<Worker, 'id' | 'created_at' | 'bmi'>) =>
    fetchJson<Worker>('/api/v1/workers/', {
      method: 'POST',
      body: JSON.stringify(worker),
    }),

  // Safety Alerts
  getActiveAlerts: () => fetchJson<SafetyAlert[]>('/api/v1/alerts/active'),
  acknowledgeAlert: (alertId: string) =>
    fetchJson<SafetyAlert>(`/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledged: true }),
    }),
  clearAllAlerts: () =>
    fetchJson<{ message: string; status: string }>('/api/v1/alerts/clear-all', {
      method: 'POST',
    }),

  // Live Meteorological Open-Meteo
  getWeather: (latitude: number, longitude: number) =>
    fetchJson<import('@/types/api').WeatherResponse>(
      `/api/v1/weather/current?latitude=${latitude}&longitude=${longitude}`
    ),
};
