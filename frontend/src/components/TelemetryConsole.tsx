'use client';

import React, { useState, useEffect } from 'react';
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
  const [heartRate, setHeartRate] = useState<number>(142);
  const [skinTemp, setSkinTemp] = useState<number>(36.2);
  const [airTemp, setAirTemp] = useState<number>(34.0);
  const [humidity, setHumidity] = useState<number>(60);
  const [durationMin, setDurationMin] = useState<number>(35);
  const [clo, setClo] = useState<number>(1.2);

  const [telemetryData, setTelemetryData] = useState<TelemetryEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const evaluate = async () => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluate();
  }, []);

  useEffect(() => {
    const timer = setTimeout(evaluate, 300);
    return () => clearTimeout(timer);
  }, [heartRate, skinTemp, airTemp, humidity, durationMin, clo]);

  const coreTemp = telemetryData?.core_temp.point_estimate_C || 37.8;
  const lowerBound = telemetryData?.core_temp.lower_bound_C || 37.4;
  const upperBound = telemetryData?.core_temp.upper_bound_C || 38.2;
  const status = telemetryData?.safety_status || 'GREEN';
  const isEmergency = telemetryData?.emergency_escalation || false;

  const getStatusColor = () => {
    switch (status) {
      case 'GREEN':
        return '#10B981';
      case 'AMBER':
        return '#F59E0B';
      case 'ORANGE':
        return '#F97316';
      case 'RED':
      case 'EMERGENCY_PURPLE':
        return '#E72D49';
      default:
        return '#244CFF';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Headline Section - Bold & Punchy */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
            Live Thermal Surveillance
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
            Physiological Heat Strain Monitor.
          </h1>
          <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
            Non-invasive core temperature estimation ($T_{'\\text{core}'}$) with conformal 90%
            uncertainty bounds and active cardiovascular reserve indexing.
          </p>
        </div>

        {/* Global Strain Indicator */}
        <div
          className="border px-6 py-4 flex flex-col justify-center min-w-[240px]"
          style={{ borderColor: getStatusColor(), backgroundColor: `${getStatusColor()}15` }}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
            CURRENT ZONE STATUS
          </span>
          <span
            className="text-2xl font-black font-display tracking-tight uppercase mt-0.5"
            style={{ color: getStatusColor() }}
          >
            {status}
          </span>
          <span className="text-[11px] font-mono text-white/70 mt-1">
            {telemetryData?.heat_strain_details.strain_label || 'Safe Baseline'}
          </span>
        </div>
      </div>

      {/* Emergency Escalate Bar */}
      {isEmergency && (
        <div className="bg-[#E72D49] text-white p-6 border-l-4 border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest bg-black px-2 py-0.5">
              EMERGENCY PROTOCOL ACTIVE
            </span>
            <h3 className="text-xl font-bold uppercase mt-2">
              Critical Core Hyperthermia Detected ({coreTemp.toFixed(1)}°C)
            </h3>
            <p className="text-xs text-white/90 mt-1 font-mono">
              Cease physical labor immediately. Transition to rehabilitation station. Initiate active external cooling.
            </p>
          </div>
          <button
            onClick={() => alert('Emergency alert broadcast sent to shift safety supervisors.')}
            className="bg-white text-[#E72D49] font-black font-mono text-xs uppercase px-6 py-3 tracking-wider hover:bg-neutral-100 shrink-0"
          >
            Dispatch Medical Team
          </button>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Huge Tactical Core Temperature Readout (7 cols) */}
        <div className="lg:col-span-7 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono tracking-widest uppercase text-white/40">
              CORE TEMPERATURE ESTIMATION
            </span>
            <span className="text-xs font-mono text-[#9470DB]">
              90% CONFIDENCE INTERVAL [{lowerBound.toFixed(2)}°C — {upperBound.toFixed(2)}°C]
            </span>
          </div>

          {/* Central Massive Core Temp Number */}
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-7xl lg:text-9xl font-black tracking-tighter tabular-nums text-white font-display">
              {coreTemp.toFixed(2)}
              <span className="text-3xl lg:text-5xl font-light text-white/30 ml-2">°C</span>
            </div>

            {/* Visual Uncertainty Range Bar */}
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono text-white/40">
                <span>Safe 36.5°C</span>
                <span>Warning 38.5°C</span>
                <span className="text-[#E72D49]">Stroke 40.0°C</span>
              </div>
              <div className="w-full h-3 bg-white/5 relative overflow-hidden">
                {/* Conformal Band */}
                <div
                  className="absolute top-0 bottom-0 bg-[#9470DB]/30"
                  style={{
                    left: `${Math.max(0, ((lowerBound - 36) / 4.5) * 100)}%`,
                    width: `${Math.max(5, ((upperBound - lowerBound) / 4.5) * 100)}%`,
                  }}
                />
                {/* Point Marker */}
                <div
                  className="absolute top-0 bottom-0 w-2 shadow-[0_0_10px_white]"
                  style={{
                    left: `${Math.max(0, Math.min(98, ((coreTemp - 36) / 4.5) * 100))}%`,
                    backgroundColor: getStatusColor(),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Protocol Guideline Footer */}
          <div className="bg-[#0D0F12] border border-white/10 p-5 mt-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-1">
              OCCUPATIONAL ACTION REQUIRED
            </span>
            <p className="text-sm font-bold text-[#FFF5D9]">
              {telemetryData?.heat_strain_details.recommended_action ||
                'Continue regular monitoring. Maintain baseline hydration.'}
            </p>
          </div>
        </div>

        {/* Right Column: Key Physiological Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                HEART RATE
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {heartRate} <span className="text-sm font-normal text-white/40">BPM</span>
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                {Math.round((heartRate / 190) * 100)}% HR Reserve Max
              </span>
            </div>

            {/* Mean Skin Temp */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                SKIN TEMP
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {skinTemp.toFixed(1)} <span className="text-sm font-normal text-white/40">°C</span>
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                Gradient: {(coreTemp - skinTemp).toFixed(1)}°C
              </span>
            </div>

            {/* Moran PSI */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                MORAN PSI INDEX
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {((coreTemp - 37.0) * 5.0 + ((heartRate - 70) / 110) * 5.0).toFixed(1)}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">Scale 0 - 10</span>
            </div>

            {/* Work / Rest Cycle */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                WORK / REST
              </span>
              <div className="text-lg font-bold text-[#FFF5D9] mt-3 font-mono">
                {telemetryData?.heat_strain_details.work_rest_recommendation || '45m / 15m'}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                Shift: {durationMin} min
              </span>
            </div>
          </div>

          {/* Interactive Tactical Sliders */}
          <div className="bg-[#14171C] border border-white/10 p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF] block">
              Sensor Emulation Sliders
            </span>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1.5 text-white/70">
                  <span>Heart Rate: {heartRate} bpm</span>
                  <span className="text-white/30">40 - 200</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-[#244CFF] bg-white/10 h-1 rounded-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-white/70">
                  <span>Skin Temperature: {skinTemp.toFixed(1)}°C</span>
                  <span className="text-white/30">28.0 - 40.0</span>
                </div>
                <input
                  type="range"
                  min="28.0"
                  max="40.0"
                  step="0.1"
                  value={skinTemp}
                  onChange={(e) => setSkinTemp(Number(e.target.value))}
                  className="w-full accent-[#244CFF] bg-white/10 h-1 rounded-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-white/70">
                  <span>Shift Duration: {durationMin} minutes</span>
                  <span className="text-white/30">5 - 240</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="240"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full accent-[#244CFF] bg-white/10 h-1 rounded-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
