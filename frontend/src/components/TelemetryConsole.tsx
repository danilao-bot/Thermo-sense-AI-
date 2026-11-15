'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Heart,
  Wind,
  Shield,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { TelemetryEvaluationResponse } from '@/types/api';

interface TelemetryConsoleProps {
  privacyMode: boolean;
  onAlertTriggered?: () => void;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({
  privacyMode,
  onAlertTriggered,
}) => {
  // Real-time sensor state controls
  const [heartRate, setHeartRate] = useState<number>(142);
  const [skinTemp, setSkinTemp] = useState<number>(36.2);
  const [airTemp, setAirTemp] = useState<number>(34.0);
  const [humidity, setHumidity] = useState<number>(60);
  const [durationMin, setDurationMin] = useState<number>(35);
  const [clo, setClo] = useState<number>(1.2);

  // Model Inference State
  const [telemetryData, setTelemetryData] = useState<TelemetryEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);

  // Fetch prediction from backend
  const evaluateCurrentTelemetry = async () => {
    setLoading(true);
    try {
      const res = await api.evaluateTelemetry({
        work_duration_min: durationMin,
        heart_rate_bpm: heartRate,
        skin_temp_mean_C: skinTemp,
        air_temp_C: airTemp,
        relative_humidity_pct: humidity,
        clothing_clo: clo,
      });
      setTelemetryData(res);
      if (res.emergency_escalation || res.active_alerts.length > 0) {
        onAlertTriggered?.();
      }
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    evaluateCurrentTelemetry();
  }, []);

  // Heartbeat simulation ticker
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      setHeartRate((prev) => Math.min(195, Math.max(70, prev + (Math.random() * 6 - 3))));
      setSkinTemp((prev) => Math.min(39.5, Math.max(32.0, prev + (Math.random() * 0.2 - 0.1))));
      setDurationMin((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoSimulate]);

  // Re-evaluate whenever telemetry sliders change
  useEffect(() => {
    const debounce = setTimeout(() => {
      evaluateCurrentTelemetry();
    }, 400);
    return () => clearTimeout(debounce);
  }, [heartRate, skinTemp, airTemp, humidity, durationMin, clo]);

  const coreTemp = telemetryData?.core_temp.point_estimate_C || 37.8;
  const lowerBound = telemetryData?.core_temp.lower_bound_C || 37.4;
  const upperBound = telemetryData?.core_temp.upper_bound_C || 38.2;
  const quality = telemetryData?.core_temp.sensor_quality_score || 0.95;
  const status = telemetryData?.safety_status || 'GREEN';
  const isEmergency = telemetryData?.emergency_escalation || false;

  const getStatusColor = () => {
    switch (status) {
      case 'GREEN':
        return 'var(--neon-jade)';
      case 'AMBER':
        return 'var(--acid-amber)';
      case 'ORANGE':
        return '#f97316';
      case 'RED':
      case 'EMERGENCY_PURPLE':
        return 'var(--cherry-red)';
      default:
        return 'var(--ultramarine)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner (Renders only during thermal escalation) */}
      {isEmergency && (
        <div className="bg-[var(--cherry-red)] text-white p-4 rounded-xl border border-red-500 shadow-[0_0_20px_var(--cherry-red-glow)] animate-pulse flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Flame className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase">
                CRITICAL OCCUPATIONAL EMERGENCY — HEAT STROKE ESCALATION DETECTED
              </h3>
              <p className="text-xs text-red-100 mt-1">
                Estimated core temperature exceeding critical safe limits ({coreTemp.toFixed(1)}°C)
                or dangerous rate of rise. Cease work immediately.
              </p>
              <div className="mt-2 text-xs font-mono bg-black/30 px-2 py-1 rounded inline-block">
                PROTOCOL: Remove PPE, transition to shaded air-conditioned shelter, initiate active
                cooling.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Dual Ring Focal Gauge + Physiological Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hero Core Temp Gauge (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--carbon-surface)] rounded-2xl border border-[var(--carbon-border)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-neutral-400">
                Model A & D Inference Engine
              </span>
              <h2 className="text-base font-semibold text-[var(--porcelain)]">
                Estimated Core Body Temperature ($T_{'\\text{core}'}$)
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] text-xs font-mono">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getStatusColor() }}
              />
              <span className="text-[var(--vanilla-cream)] font-bold">{status} ZONE</span>
            </div>
          </div>

          {/* Focal Gauge Display */}
          <div className="py-8 flex flex-col items-center justify-center relative">
            {/* Circular Gauge Visualization */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="128"
                  cy="128"
                  r="108"
                  stroke="var(--carbon-border)"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Conformal Uncertainty Arc (Sugar Violet) */}
                <circle
                  cx="128"
                  cy="128"
                  r="108"
                  stroke="var(--sugar-violet)"
                  strokeWidth="14"
                  strokeDasharray="678"
                  strokeDashoffset={678 - (678 * (upperBound - 35)) / 6.5}
                  strokeLinecap="round"
                  fill="transparent"
                  opacity="0.35"
                />
                {/* Point Estimate Arc */}
                <circle
                  cx="128"
                  cy="128"
                  r="108"
                  stroke={getStatusColor()}
                  strokeWidth="14"
                  strokeDasharray="678"
                  strokeDashoffset={678 - (678 * (coreTemp - 35)) / 6.5}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Central Value Readout */}
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-extrabold tracking-tight tabular-nums text-[var(--porcelain)]">
                  {coreTemp.toFixed(2)}
                  <span className="text-2xl font-normal text-neutral-400">°C</span>
                </span>
                <span className="text-xs font-mono text-[var(--vanilla-cream)] mt-1">
                  Baseline: 37.00°C
                </span>
              </div>
            </div>

            {/* Model D Conformal 90% Bound Pill */}
            <div className="mt-4 flex items-center gap-2 bg-[var(--carbon-elevated)] border border-[var(--sugar-violet)]/40 px-3.5 py-1.5 rounded-xl">
              <Shield className="h-4 w-4 text-[var(--sugar-violet)]" />
              <span className="text-xs font-mono text-[var(--sugar-violet)]">
                90% Conformal Interval: [{lowerBound.toFixed(2)}°C – {upperBound.toFixed(2)}°C]
              </span>
            </div>
          </div>

          {/* Sensor Reliability & Diagnostics Footer */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--carbon-border)] text-xs font-mono">
            <div className="bg-[var(--carbon-elevated)] p-2.5 rounded-xl border border-[var(--carbon-border)]">
              <span className="text-neutral-400 block text-[10px]">SENSOR QUALITY SCORE</span>
              <span className="text-sm font-bold text-[var(--porcelain)]">
                {(quality * 100).toFixed(0)}% Reliable
              </span>
            </div>
            <div className="bg-[var(--carbon-elevated)] p-2.5 rounded-xl border border-[var(--carbon-border)]">
              <span className="text-neutral-400 block text-[10px]">DATA PROVENANCE</span>
              <span className="text-sm font-bold text-[var(--ultramarine)]">
                ML Hybrid (Model A)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Physiological Quad-Grid & Telemetry Sliders (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Quad Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate Card */}
            <div className="bg-[var(--carbon-surface)] p-4 rounded-xl border border-[var(--carbon-border)]">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span className="font-mono">HEART RATE</span>
                <Heart className="h-4 w-4 text-[var(--cherry-red)]" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[var(--porcelain)]">
                {heartRate}{' '}
                <span className="text-xs font-normal text-neutral-400">bpm</span>
              </div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">
                Cardiovascular strain: {Math.round((heartRate / 190) * 100)}% Max
              </div>
            </div>

            {/* Mean Skin Temp Card */}
            <div className="bg-[var(--carbon-surface)] p-4 rounded-xl border border-[var(--carbon-border)]">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span className="font-mono">MEAN SKIN TEMP</span>
                <Thermometer className="h-4 w-4 text-[var(--ultramarine)]" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[var(--porcelain)]">
                {skinTemp.toFixed(1)}{' '}
                <span className="text-xs font-normal text-neutral-400">°C</span>
              </div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">
                Core-Skin Gradient: {(coreTemp - skinTemp).toFixed(1)}°C
              </div>
            </div>

            {/* Moran PSI Index */}
            <div className="bg-[var(--carbon-surface)] p-4 rounded-xl border border-[var(--carbon-border)]">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span className="font-mono">MORAN PSI (0–10)</span>
                <Activity className="h-4 w-4 text-[var(--neon-jade)]" />
              </div>
              <div className="text-3xl font-extrabold tabular-nums text-[var(--porcelain)]">
                {telemetryData ? (
                  ((coreTemp - 37.0) * 5.0 + ((heartRate - 70) / 110) * 5.0).toFixed(1)
                ) : (
                  '4.8'
                )}
              </div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">
                Status: {status === 'GREEN' ? 'Physiologically Safe' : 'Elevated Strain'}
              </div>
            </div>

            {/* Work/Rest Recommendation */}
            <div className="bg-[var(--carbon-surface)] p-4 rounded-xl border border-[var(--carbon-border)]">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span className="font-mono">WORK/REST CYCLE</span>
                <Clock className="h-4 w-4 text-[var(--vanilla-cream)]" />
              </div>
              <div className="text-lg font-bold text-[var(--vanilla-cream)] mt-1">
                {telemetryData?.heat_strain_details.work_rest_recommendation ||
                  '45m Work / 15m Rest'}
              </div>
              <div className="text-[11px] font-mono text-neutral-400 mt-2">
                Shift Elapsed: {durationMin} min
              </div>
            </div>
          </div>

          {/* Interactive Simulation Sliders (Allows supervisor to test wearable readings) */}
          <div className="bg-[var(--carbon-surface)] p-5 rounded-2xl border border-[var(--carbon-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[var(--vanilla-cream)]">
                Wearable Telemetry Controls (Live Sliders)
              </span>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  autoSimulate
                    ? 'bg-[var(--neon-jade)]/20 text-[var(--neon-jade)] border border-[var(--neon-jade)]'
                    : 'bg-[var(--carbon-elevated)] text-neutral-300 hover:text-white'
                }`}
              >
                <RefreshCw
                  className={`h-3 w-3 ${autoSimulate ? 'animate-spin' : ''}`}
                />
                <span>{autoSimulate ? 'Simulating Live Stream' : 'Live Stream Inactive'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Heart Rate: {heartRate} bpm</span>
                  <span className="text-neutral-500">Range: 40 - 200</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-[var(--ultramarine)]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Skin Temp: {skinTemp.toFixed(1)}°C</span>
                  <span className="text-neutral-500">Range: 28.0 - 40.0</span>
                </div>
                <input
                  type="range"
                  min="28.0"
                  max="40.0"
                  step="0.1"
                  value={skinTemp}
                  onChange={(e) => setSkinTemp(Number(e.target.value))}
                  className="w-full accent-[var(--ultramarine)]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Shift Duration: {durationMin} min</span>
                  <span className="text-neutral-500">Range: 5 - 240</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="240"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full accent-[var(--ultramarine)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
