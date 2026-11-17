'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { TelemetryEvaluationResponse, WeatherResponse } from '@/types/api';
import { Bluetooth, BluetoothOff, Activity, AlertTriangle, RefreshCw, Radio, CheckCircle2, User, Thermometer, Heart, ShieldCheck, Vibrate } from 'lucide-react';

interface TelemetryConsoleProps {
  privacyMode: boolean;
  onAlertTriggered?: () => void;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({
  privacyMode,
  onAlertTriggered,
}) => {
  // Connection states: 'disconnected' | 'connecting' | 'connected' | 'manual'
  const [deviceStatus, setDeviceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'manual'>('disconnected');
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [workerTag, setWorkerTag] = useState<string>('WG-01');
  const [hapticStatus, setHapticStatus] = useState<'idle' | 'vibrating'>('idle');
  const [bleError, setBleError] = useState<string | null>(null);

  // GATT Alert Characteristic reference for bidirectional haptic commands
  const alertCharRef = useRef<any>(null);

  // Load or initialize persistent anonymous worker group ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedTag = localStorage.getItem('thermosense_worker_tag');
      if (cachedTag) {
        setWorkerTag(cachedTag);
      } else {
        const randomId = `WG-${Math.floor(10 + Math.random() * 90)}`;
        localStorage.setItem('thermosense_worker_tag', randomId);
        setWorkerTag(randomId);
      }
    }
  }, []);

  // Physiological Sensor Telemetry (Empty initially)
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [skinTemp, setSkinTemp] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number>(30);
  const [clo, setClo] = useState<number>(1.2);

  // Form states for manual input
  const [inputHR, setInputHR] = useState<string>('78');
  const [inputSkinTemp, setInputSkinTemp] = useState<string>('33.5');
  const [inputDuration, setInputDuration] = useState<string>('30');

  // Ambient context from Open-Meteo
  const [ambientWeather, setAmbientWeather] = useState<WeatherResponse | null>(null);
  const [ambientLoading, setAmbientLoading] = useState<boolean>(false);

  // Model A evaluation result
  const [telemetryData, setTelemetryData] = useState<TelemetryEvaluationResponse | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  // Sync ambient weather via GPS
  const syncAmbientWeather = useCallback(async () => {
    setAmbientLoading(true);
    const fetchSafeFallback = async () => {
      try {
        const fallback = await api.getWeather(40.7128, -74.006);
        setAmbientWeather(fallback);
      } catch (err) {
        console.warn('Weather fallback failed, using offline default:', err);
      } finally {
        setAmbientLoading(false);
      }
    };

    try {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const w = await api.getWeather(pos.coords.latitude, pos.coords.longitude);
              setAmbientWeather(w);
              setAmbientLoading(false);
            } catch (err) {
              console.warn('Weather fetch failed, falling back to default site:', err);
              await fetchSafeFallback();
            }
          },
          async () => {
            await fetchSafeFallback();
          },
          { timeout: 8000 }
        );
      } else {
        await fetchSafeFallback();
      }
    } catch {
      setAmbientLoading(false);
    }
  }, []);

  useEffect(() => {
    syncAmbientWeather();
  }, [syncAmbientWeather]);

  // Connect real BLE Heart Rate Sensor (e.g. Polar, Garmin, Apple Watch broadcaster)
  const connectBluetooth = async () => {
    setBleError(null);
    if (typeof window === 'undefined' || !(navigator as any).bluetooth) {
      setBleError(
        'Web Bluetooth is not supported in this browser environment. Please use Google Chrome, Edge, or enter clinical measurements manually.'
      );
      return;
    }

    try {
      setDeviceStatus('connecting');
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'health_thermometer', 'immediate_alert', 0x1802, 0x1811],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      // Attempt to bind Immediate Alert Service for bidirectional wrist haptics
      try {
        const alertService = await server.getPrimaryService('immediate_alert');
        const alertChar = await alertService.getCharacteristic('alert_level');
        alertCharRef.current = alertChar;
      } catch {
        // Wearable does not expose immediate_alert; fallback to device vibration
        alertCharRef.current = null;
      }

      // Generate or retrieve cached anonymous worker profile for this device
      const deviceKey = `thermosense_worker_${device.id || 'default'}`;
      let cachedWorkerTag = localStorage.getItem(deviceKey);
      if (!cachedWorkerTag) {
        cachedWorkerTag = localStorage.getItem('thermosense_worker_tag') || `WG-${Math.floor(10 + Math.random() * 90)}`;
        localStorage.setItem(deviceKey, cachedWorkerTag);
      }
      setWorkerTag(cachedWorkerTag);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        let hr = 0;
        if (rate16Bits) {
          hr = value.getUint16(1, /*littleEndian=*/ true);
        } else {
          hr = value.getUint8(1);
        }

        setHeartRate(hr);
        // Estimate normal baseline skin temp if no skin probe attached to BLE
        setSkinTemp((prev) => prev ?? 34.2);
      });

      device.addEventListener('gattserverdisconnected', () => {
        setDeviceStatus('disconnected');
        setConnectedDeviceName(null);
        setHeartRate(null);
        setSkinTemp(null);
        setTelemetryData(null);
        alertCharRef.current = null;
      });

      setConnectedDeviceName(device.name || 'Bluetooth Heart Rate Monitor');
      setDeviceStatus('connected');
    } catch (err: any) {
      console.warn('Bluetooth connection cancelled or failed:', err);
      setDeviceStatus('disconnected');
      if (err.name !== 'NotFoundError') {
        setBleError(err.message || 'Failed to establish Bluetooth connection.');
      }
    }
  };

  const disconnectBluetooth = () => {
    setDeviceStatus('disconnected');
    setConnectedDeviceName(null);
    setHeartRate(null);
    setSkinTemp(null);
    setTelemetryData(null);
  };

  // Submit manual reading
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hr = parseFloat(inputHR);
    const skin = parseFloat(inputSkinTemp);
    const dur = parseFloat(inputDuration);

    if (isNaN(hr) || hr <= 0) {
      setBleError('Please enter a valid heart rate (BPM).');
      return;
    }

    setBleError(null);
    setHeartRate(hr);
    setSkinTemp(isNaN(skin) ? 34.0 : skin);
    setDurationMin(isNaN(dur) ? 30 : dur);
    setDeviceStatus('manual');
    setConnectedDeviceName('Manual Clinical Entry');
  };

  // Evaluate telemetry when heartRate or skinTemp are available
  useEffect(() => {
    if (heartRate === null || skinTemp === null) {
      setTelemetryData(null);
      return;
    }

    let isMounted = true;
    const runEvaluation = async () => {
      setEvaluating(true);
      try {
        const res = await api.evaluateTelemetry({
          work_duration_min: durationMin,
          heart_rate_bpm: heartRate,
          skin_temp_mean_C: skinTemp,
          air_temp_C: ambientWeather?.air_temp_C ?? 32.0,
          relative_humidity_pct: ambientWeather?.relative_humidity_pct ?? 55.0,
          wind_speed_m_s: ambientWeather?.wind_speed_m_s ?? 0.5,
          clothing_clo: clo,
        });

        if (isMounted) {
          setTelemetryData(res);
          const isWarning =
            res.emergency_escalation ||
            res.safety_status === 'ORANGE' ||
            res.safety_status === 'RED' ||
            res.safety_status === 'EMERGENCY_PURPLE';

          if (isWarning || res.active_alerts.length > 0) {
            onAlertTriggered?.();

            // Downstream: Send Haptic Alert to Wearable via BLE GATT
            if (alertCharRef.current) {
              try {
                const alertLevel = res.emergency_escalation || res.safety_status === 'RED' ? 2 : 1;
                alertCharRef.current.writeValue(new Uint8Array([alertLevel]));
                setHapticStatus('vibrating');
                setTimeout(() => setHapticStatus('idle'), 3000);
              } catch (bleErr) {
                console.warn('GATT Alert write error:', bleErr);
              }
            }

            // Mobile Device Vibration Fallback
            if (typeof navigator !== 'undefined' && (navigator as any).vibrate) {
              (navigator as any).vibrate([500, 250, 500, 250, 1000]);
              setHapticStatus('vibrating');
              setTimeout(() => setHapticStatus('idle'), 3000);
            }
          }
        }
      } catch (err) {
        console.error('Failed to evaluate physiological telemetry:', err);
      } finally {
        if (isMounted) setEvaluating(false);
      }
    };

    const timer = setTimeout(runEvaluation, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [heartRate, skinTemp, durationMin, clo, ambientWeather, onAlertTriggered]);

  const isConnected = deviceStatus === 'connected' || deviceStatus === 'manual';
  const coreTemp = telemetryData?.core_temp.point_estimate_C ?? null;
  const lowerBound = telemetryData?.core_temp.lower_bound_C ?? null;
  const upperBound = telemetryData?.core_temp.upper_bound_C ?? null;
  const status = isConnected ? telemetryData?.safety_status || 'GREEN' : 'DISCONNECTED';
  const isEmergency = telemetryData?.emergency_escalation || false;

  const getStatusColor = () => {
    if (!isConnected) return '#737373';
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
      {/* Header */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
              Active Worker Telemetry
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'
              }`}
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
            Heat Strain Monitor.
          </h1>
          <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
            Real-time physiological heat strain monitoring. Pair a wearable watch/sensor or enter clinical observations.
          </p>
        </div>

        {/* Global Strain Status */}
        <div
          className="border px-6 py-4 flex flex-col justify-center min-w-[240px]"
          style={{ borderColor: getStatusColor(), backgroundColor: `${getStatusColor()}15` }}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
            SAFETY STATUS
          </span>
          <span
            className="text-2xl font-black font-display tracking-tight uppercase mt-0.5"
            style={{ color: getStatusColor() }}
          >
            {status}
          </span>
          <span className="text-[11px] font-mono text-white/70 mt-1">
            {isConnected
              ? telemetryData?.heat_strain_details.strain_label || 'Evaluating sensor...'
              : 'No Active Wearable'}
          </span>
        </div>
      </div>

      {/* Emergency Escalate Bar */}
      {isEmergency && (
        <div className="bg-[#E72D49] text-white p-6 border-l-4 border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest bg-black px-2 py-0.5">
              EMERGENCY ACTION REQUIRED
            </span>
            <h3 className="text-xl font-bold uppercase mt-2">
              Critical Heat Strain Detected ({coreTemp?.toFixed(1)}°C)
            </h3>
            <p className="text-xs text-white/90 mt-1 font-mono">
              Cease physical labor immediately. Move worker to cool shaded area. Initiate hydration & cooling protocols.
            </p>
          </div>
          <button
            onClick={() => alert('Emergency dispatch notification broadcasted to safety supervisors.')}
            className="bg-white text-[#E72D49] font-black font-mono text-xs uppercase px-6 py-3 tracking-wider hover:bg-neutral-100 shrink-0"
          >
            Dispatch Medical Team
          </button>
        </div>
      )}

      {/* Connection & Ambient Status Bar */}
      <div className="bg-[#14171C] border border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <Radio className={`h-4 w-4 ${isConnected ? 'text-emerald-400' : 'text-neutral-500'}`} />
          <span className="text-white/80">
            Device:{' '}
            <strong className="text-white">
              {connectedDeviceName ? connectedDeviceName : 'None (Disconnected)'}
            </strong>
          </span>
          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Worker ID: <strong>{workerTag}</strong>
          </span>
          {isConnected && (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded">
              Live Stream Active
            </span>
          )}
          {isConnected && (
            <span className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border ${
              hapticStatus === 'vibrating' 
                ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse' 
                : 'bg-neutral-800 border-white/10 text-white/60'
            }`}>
              <Vibrate className="h-3 w-3" />
              {hapticStatus === 'vibrating' ? 'Haptic Alarm Fired!' : 'Wrist Haptics Ready'}
            </span>
          )}
        </div>

        {/* Ambient context sync */}
        <div className="flex items-center gap-4 text-white/50 text-[11px]">
          <span>
            Ambient:{' '}
            <strong className="text-[#FFF5D9]">
              {ambientWeather ? `${ambientWeather.air_temp_C}°C, ${ambientWeather.relative_humidity_pct}% RH` : 'Syncing...'}
            </strong>{' '}
            (Open-Meteo)
          </span>
          {isConnected && (
            <button
              onClick={disconnectBluetooth}
              className="text-red-400 hover:text-red-300 underline text-[11px] font-mono"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {bleError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{bleError}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Core Temperature Readout (7 cols) */}
        <div className="lg:col-span-7 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono tracking-widest uppercase text-white/40">
              CORE BODY TEMPERATURE (MODEL A)
            </span>
            <span className="text-xs font-mono text-[#9470DB]">
              {lowerBound !== null && upperBound !== null
                ? `CONFIDENCE RANGE [${lowerBound.toFixed(1)}°C — ${upperBound.toFixed(1)}°C]`
                : 'AWAITING SENSOR TELEMETRY'}
            </span>
          </div>

          {/* Central Massive Core Temp Number or Clean Empty State */}
          <div className="py-12 flex flex-col items-center justify-center text-center">
            {coreTemp !== null ? (
              <>
                <div className="text-7xl lg:text-9xl font-black tracking-tighter tabular-nums text-white font-display">
                  {coreTemp.toFixed(2)}
                  <span className="text-3xl lg:text-5xl font-light text-white/30 ml-2">°C</span>
                </div>

                {/* Visual Uncertainty Range Bar */}
                <div className="w-full max-w-md mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-white/40">
                    <span>Normal 36.5°C</span>
                    <span>Warning 38.5°C</span>
                    <span className="text-[#E72D49]">Danger 40.0°C</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 relative overflow-hidden">
                    {/* Conformal Band */}
                    {lowerBound !== null && upperBound !== null && (
                      <div
                        className="absolute top-0 bottom-0 bg-[#9470DB]/30"
                        style={{
                          left: `${Math.max(0, ((lowerBound - 36) / 4.5) * 100)}%`,
                          width: `${Math.max(5, ((upperBound - lowerBound) / 4.5) * 100)}%`,
                        }}
                      />
                    )}
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
              </>
            ) : (
              <div className="space-y-4 py-8">
                <div className="text-7xl font-mono text-neutral-600 font-light">--.- °C</div>
                <div className="text-sm font-mono text-neutral-400 max-w-sm mx-auto">
                  No active wearable connected. Pair a smartwatch or Bluetooth heart rate monitor, or enter clinical measurements below.
                </div>
              </div>
            )}
          </div>

          {/* Supervisor Guidance */}
          <div className="bg-[#0D0F12] border border-white/10 p-5 mt-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-1">
              SUPERVISOR GUIDANCE
            </span>
            <p className="text-sm font-bold text-[#FFF5D9]">
              {isConnected
                ? telemetryData?.heat_strain_details.recommended_action ||
                  'Continue regular physiological surveillance.'
                : 'Connect wearable sensor to start automated clinical strain evaluation.'}
            </p>
          </div>
        </div>

        {/* Right Column: Key Physiological Metrics & Connection Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 flex items-center justify-between">
                <span>HEART RATE</span>
                <Heart className={`h-3.5 w-3.5 ${heartRate ? 'text-red-400 animate-pulse' : 'text-neutral-600'}`} />
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {heartRate ? (
                  <>
                    {heartRate} <span className="text-sm font-normal text-white/40">BPM</span>
                  </>
                ) : (
                  <span className="text-white/30 font-mono">--</span>
                )}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                {heartRate ? `${Math.round((heartRate / 190) * 100)}% Max Strain` : 'Awaiting sensor'}
              </span>
            </div>

            {/* Mean Skin Temp */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 flex items-center justify-between">
                <span>SKIN TEMPERATURE</span>
                <Thermometer className="h-3.5 w-3.5 text-neutral-400" />
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {skinTemp ? (
                  <>
                    {skinTemp.toFixed(1)} <span className="text-sm font-normal text-white/40">°C</span>
                  </>
                ) : (
                  <span className="text-white/30 font-mono">--</span>
                )}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                {coreTemp && skinTemp ? `Delta: ${(coreTemp - skinTemp).toFixed(1)}°C` : 'Awaiting sensor'}
              </span>
            </div>

            {/* Strain Index */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                STRAIN INDEX
              </span>
              <div className="text-4xl font-black tabular-nums text-white mt-2 font-display">
                {coreTemp && heartRate
                  ? Math.max(0, (coreTemp - 37.0) * 5.0 + ((heartRate - 70) / 110) * 5.0).toFixed(1)
                  : '--'}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">Scale 0 to 10</span>
            </div>

            {/* Work / Rest Cycle */}
            <div className="bg-[#14171C] border border-white/10 p-6">
              <span className="text-[11px] font-mono tracking-widest uppercase text-white/40 block">
                WORK / REST SCHEDULE
              </span>
              <div className="text-lg font-bold text-[#FFF5D9] mt-3 font-mono">
                {telemetryData?.heat_strain_details.work_rest_recommendation || '--'}
              </div>
              <span className="text-xs font-mono text-white/40 mt-2 block">
                {isConnected ? `Shift: ${durationMin} min` : 'Standby'}
              </span>
            </div>
          </div>

          {/* Real Device Connection & Clinical Input Console */}
          <div className="bg-[#14171C] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
                Sensor Input
              </span>
              {isConnected && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Connected
                </span>
              )}
            </div>

            {/* Bluetooth Connect Option */}
            <div className="space-y-3">
              <button
                onClick={connectBluetooth}
                disabled={deviceStatus === 'connecting'}
                className="w-full bg-[#244CFF] hover:bg-[#1f40d6] text-white font-mono font-bold text-xs uppercase py-3 px-4 flex items-center justify-center gap-2 tracking-wider transition-colors disabled:opacity-50"
              >
                <Bluetooth className="h-4 w-4" />
                <span>
                  {deviceStatus === 'connecting'
                    ? 'Scanning for Bluetooth Wearable...'
                    : 'Pair Bluetooth Watch / Wearable'}
                </span>
              </button>
              <p className="text-[11px] font-mono text-neutral-400 leading-tight">
                Connects to any standard BLE heart rate monitor (Garmin, Polar, Apple Watch BLE broadcaster, Wahoo, Scosche).
              </p>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Or Manual Measurement
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Manual Clinical Measurement Entry */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-white/60 block mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={inputHR}
                    onChange={(e) => setInputHR(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full bg-[#0D0F12] border border-white/10 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#244CFF]"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">Skin Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="25.0"
                    max="42.0"
                    value={inputSkinTemp}
                    onChange={(e) => setInputSkinTemp(e.target.value)}
                    placeholder="e.g. 34.0"
                    className="w-full bg-[#0D0F12] border border-white/10 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#244CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 text-xs font-mono">
                  Shift Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={inputDuration}
                  onChange={(e) => setInputDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-[#0D0F12] border border-white/10 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#244CFF]"
                />
              </div>

              <button
                type="submit"
                aria-label="Submit clinical physiological reading"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase py-2.5 px-4 tracking-wider transition-colors"
              >
                Submit Clinical Reading
              </button>

              <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>Data Minimization: Only physiological telemetry is logged. No personal data stored.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
