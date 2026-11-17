'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ExternalLink,
  Cpu,
  Radio,
  Layers,
  Shield,
  Terminal,
  Crosshair,
  Flame,
  Droplets,
  Sliders,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import { LegalModal } from '@/components/LegalModal';

export default function LandingPage() {
  const [activeModelTab, setActiveModelTab] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [simulatedHeartRate, setSimulatedHeartRate] = useState<number>(132);
  const [simulatedCoreTemp, setSimulatedCoreTemp] = useState<number>(37.82);
  const [packetTick, setPacketTick] = useState<number>(942);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cookies' | 'data-deletion'>('privacy');

  const openLegalWithTab = (tab: 'privacy' | 'terms' | 'cookies' | 'data-deletion') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const apiDocsUrl = typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/docs`
    : 'http://127.0.0.1:8000/docs';

  // Gentle simulated telemetry ticker for the tactical HUD
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedHeartRate((prev) => 128 + Math.floor(Math.sin(Date.now() / 3000) * 8));
      setSimulatedCoreTemp((prev) => +(37.8 + Math.sin(Date.now() / 5000) * 0.12).toFixed(2));
      setPacketTick((prev) => (prev + 1) % 9999);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#E8EBED] flex flex-col justify-between selection:bg-[#244CFF] selection:text-white">
      {/* Precision Top Navbar */}
      <header className="border-b border-white/10 bg-[#0D0F12] sticky top-0 z-50 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-extrabold text-xl tracking-tight text-white uppercase font-display"
            >
              THERMOSENSE
            </Link>
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono text-white/40 border-l border-white/10 pl-4 uppercase">
              <span className="inline-block h-1.5 w-1.5 bg-[#10B981]" />
              <span>SYSTEM ONLINE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-white/60">
            <a href="#overview" className="hover:text-white transition-colors">
              Overview
            </a>
            <a href="#models" className="hover:text-white transition-colors">
              AI Models
            </a>
            <a href="#comparison" className="hover:text-white transition-colors">
              Benchmark
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#standards" className="hover:text-white transition-colors">
              Standards
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-[#244CFF] hover:bg-[#3860FF] text-white text-xs font-mono uppercase tracking-wider font-bold px-5 py-2.5 flex items-center gap-2 border border-[#244CFF] transition-all"
            >
              <span>OPEN HEAT-HEALTH DASHBOARD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION WITH TACTICAL TELEMETRY HUD */}
        <section id="overview" className="px-6 lg:px-12 pt-14 pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-4">
                <span className="inline-block h-1.5 w-1.5 bg-[#244CFF]" />
                <span>OCCUPATIONAL PHYSIOLOGICAL SURVEILLANCE</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white uppercase leading-[1.05]">
                Continuous Non-Invasive Core Body Temperature
              </h1>

              <p className="mt-6 text-base sm:text-xl text-white/70 leading-relaxed max-w-2xl">
                Prevent industrial heat stroke, acute kidney injury, and cardiovascular collapse before symptoms emerge. Dual-sensor thermal balance estimation backed by distribution-free conformal bounds and hyper-local microclimate intelligence.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/dashboard"
                  className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-8 py-4 flex items-center justify-center gap-3 border border-[#244CFF] transition-all"
                >
                  <span>OPEN HEAT-HEALTH DASHBOARD</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={apiDocsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-mono uppercase tracking-wider text-sm px-6 py-4 flex items-center justify-center gap-2 border border-white/15 transition-all"
                >
                  <FileCode className="h-4 w-4 text-white/40" />
                  <span>REST API Spec</span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/40" />
                </a>
              </div>

              {/* System Spec Meta */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono text-xs text-white/50">
                <div>
                  <div className="text-white font-bold text-sm">RMSE &lt; 0.3°C</div>
                  <div className="text-[11px] uppercase mt-0.5">Core Validation Error</div>
                </div>
                <div>
                  <div className="text-[#10B981] font-bold text-sm">&lt; 15 MS</div>
                  <div className="text-[11px] uppercase mt-0.5">Edge Forward Pass</div>
                </div>
                <div>
                  <div className="text-[#FFB800] font-bold text-sm">ISO 7243</div>
                  <div className="text-[11px] uppercase mt-0.5">Work-Rest Standard</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Tactical HUD */}
            <div className="lg:col-span-5">
              <div className="border border-white/15 bg-[#14171C]">
                {/* HUD Header */}
                <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between text-xs font-mono text-white/50 bg-[#0F1216]">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-3.5 w-3.5 text-[#244CFF]" />
                    <span className="text-white uppercase font-bold tracking-wider">
                      LIVE INFERENCE HUD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[#10B981] animate-pulse" />
                    <span>PKT #{packetTick.toString().padStart(4, '0')}</span>
                  </div>
                </div>

                {/* Primary Metric Panel */}
                <div className="p-6 space-y-6">
                  {/* Worker Subject Bar */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/40 uppercase">SUBJECT:</span>
                    <span className="text-white font-bold">WORKER-409 [FOUNDRY CREW]</span>
                  </div>

                  {/* Core Temp Gauge */}
                  <div className="border border-white/10 bg-[#0D0F12] p-5">
                    <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-1">
                      <span>ESTIMATED CORE TEMPERATURE</span>
                      <span className="text-[#FFB800]">ELEVATED STRAIN</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-black text-white tabular-nums">
                        {simulatedCoreTemp.toFixed(2)}
                      </span>
                      <span className="text-2xl font-display text-white/50 font-bold">°C</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-white/40 border-t border-white/5 pt-2">
                      <span>95% CONFORMAL BOUNDS:</span>
                      <span className="text-white font-bold">
                        {(simulatedCoreTemp - 0.18).toFixed(2)}°C — {(simulatedCoreTemp + 0.19).toFixed(2)}°C
                      </span>
                    </div>
                  </div>

                  {/* Multimodal Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="border border-white/10 bg-[#0D0F12] p-3">
                      <div className="text-white/40 uppercase text-[10px]">CARDIAC STRAIN</div>
                      <div className="text-xl font-bold text-white mt-1 tabular-nums">
                        {simulatedHeartRate} <span className="text-xs font-normal text-white/50">BPM</span>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-[#0D0F12] p-3">
                      <div className="text-white/40 uppercase text-[10px]">SKIN TEMPERATURE</div>
                      <div className="text-xl font-bold text-white mt-1 tabular-nums">
                        35.6 <span className="text-xs font-normal text-white/50">°C</span>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-[#0D0F12] p-3">
                      <div className="text-white/40 uppercase text-[10px]">AMBIENT WBGT</div>
                      <div className="text-xl font-bold text-[#FFB800] mt-1 tabular-nums">
                        31.4 <span className="text-xs font-normal text-white/50">°C</span>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-[#0D0F12] p-3">
                      <div className="text-white/40 uppercase text-[10px]">ACUTE FLUID DEFICIT</div>
                      <div className="text-xl font-bold text-[#244CFF] mt-1 tabular-nums">
                        740 <span className="text-xs font-normal text-white/50">ML</span>
                      </div>
                    </div>
                  </div>

                  {/* Automated Protocol Action */}
                  <div className="border-l-2 border-[#FFB800] bg-[#FFB800]/5 px-3 py-2.5 text-xs font-mono flex items-center justify-between">
                    <span className="text-white/70">ISO MANDATE:</span>
                    <span className="text-[#FFB800] font-bold">15 MIN COOLING REST REQUIRED</span>
                  </div>
                </div>

                {/* HUD Footer */}
                <div className="border-t border-white/10 px-4 py-2.5 bg-[#0F1216] flex items-center justify-between text-[11px] font-mono text-white/40">
                  <span>BLE PROTOCOL: GATT 0x180D ACTIVE</span>
                  <span className="text-[#10B981]">MODEL A + D SYNCED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON BENCHMARK: TRADITIONAL VS THERMOSENSE */}
        <section id="comparison" className="px-6 lg:px-12 py-20 border-b border-white/10 bg-[#101317]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
              <span>01 // PERFORMANCE BENCHMARK</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Industrial Safety: Legacy Approaches vs. ThermoSense
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl text-base">
              Why manual clipboard monitoring and static wet-bulb monitors fail to protect high-exertion industrial workforces.
            </p>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10 font-mono text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#14171C] border-b border-white/10 text-white/60 text-xs uppercase tracking-wider">
                    <th className="p-4 border-r border-white/10">SURVEILLANCE CRITERIA</th>
                    <th className="p-4 border-r border-white/10">RECTAL / INGESTIBLE PILLS</th>
                    <th className="p-4 border-r border-white/10">MANUAL CLIPBOARD LOGS</th>
                    <th className="p-4 bg-[#244CFF]/10 text-white font-bold">THERMOSENSE EDGE AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white border-r border-white/10">Operational Burden</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Extreme ($80+/pill or invasive)</td>
                    <td className="p-4 text-white/50 border-r border-white/10">High (supervisor labor intensive)</td>
                    <td className="p-4 text-[#10B981] font-bold bg-[#244CFF]/5">Zero (standard wearable BLE)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white border-r border-white/10">Continuous Inference</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Continuous (until excreted)</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Periodic (every 2-4 hours)</td>
                    <td className="p-4 text-[#10B981] font-bold bg-[#244CFF]/5">Real-time (every 5 seconds)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white border-r border-white/10">Symptom Lag</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Zero lag</td>
                    <td className="p-4 text-[#E72D49] border-r border-white/10">Severe (detects after collapse)</td>
                    <td className="p-4 text-[#10B981] font-bold bg-[#244CFF]/5">Early warning (15 min lead time)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white border-r border-white/10">Microclimate Coupling</td>
                    <td className="p-4 text-white/50 border-r border-white/10">None (internal core only)</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Static area thermometer</td>
                    <td className="p-4 text-[#10B981] font-bold bg-[#244CFF]/5">Dynamic Open-Meteo GPS WBGT</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white border-r border-white/10">Uncertainty Bounds</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Hardware drift</td>
                    <td className="p-4 text-white/50 border-r border-white/10">Subjective guessing</td>
                    <td className="p-4 text-[#10B981] font-bold bg-[#244CFF]/5">Certified 95% Conformal Intervals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* INTERACTIVE 4-MODEL ARCHITECTURE EXPLORER */}
        <section id="models" className="px-6 lg:px-12 py-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-3">
              <Cpu className="h-3.5 w-3.5" />
              <span>02 // CORE BIOPHYSICAL MODELS</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              The Four Analytical Inference Engines
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl text-base">
              Select an engine to inspect mathematical formulations, input vectors, and operational safety tolerances.
            </p>

            {/* Model Switcher Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {[
                { id: 'A', name: 'MODEL A: CORE TEMPERATURE' },
                { id: 'B', name: 'MODEL B: MICROCLIMATE WBGT' },
                { id: 'C', name: 'MODEL C: FLUID DYNAMICS' },
                { id: 'D', name: 'MODEL D: CONFORMAL BOUNDS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModelTab(tab.id as 'A' | 'B' | 'C' | 'D')}
                  className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all border ${
                    activeModelTab === tab.id
                      ? 'bg-[#244CFF] text-white border-[#244CFF]'
                      : 'bg-[#14171C] text-white/60 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Model Details Body */}
            <div className="mt-6 border border-white/10 bg-[#14171C] p-8">
              {activeModelTab === 'A' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-[#244CFF] font-bold uppercase">
                        INFERENCE ENGINE • MODEL A
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white uppercase mt-1">
                        Non-Invasive Core Body Temperature Estimation
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-[#10B981] font-bold">
                      RMSE ERROR &lt; 0.3°C
                    </div>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                    Formulated from Pennes bioheat thermal balance equations and machine learning models trained on occupational physiological chamber datasets. Uses continuous cardiac frequency dynamics and skin thermal dissipation to compute internal core temperature.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">INPUT VECTORS</div>
                      <div className="text-white font-bold">HR, Skin Temp, Workload (MET), Clothing (clo)</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">TARGET RESOLUTION</div>
                      <div className="text-[#244CFF] font-bold">Continuous T_core (°C) @ 5-sec epochs</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">THRESHOLD TRIGGER</div>
                      <div className="text-[#FFB800] font-bold">38.0°C (Warning) / 38.5°C (Critical)</div>
                    </div>
                  </div>
                </div>
              )}

              {activeModelTab === 'B' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-[#FFB800] font-bold uppercase">
                        ATMOSPHERIC ENGINE • MODEL B
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white uppercase mt-1">
                        Hyper-Local WBGT & Physical Work Capacity Loss
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-[#FFB800] font-bold">
                      AUTOMATED GPS RE-SYNC
                    </div>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                    Queries Open-Meteo high-resolution meteorological models at the worker's coordinate locus. Calculates Wet-Bulb Globe Temperature (ISO 7243) and models Physical Work Capacity (PWC) degradation under direct solar irradiance and high relative humidity.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">METEOROLOGICAL INGEST</div>
                      <div className="text-white font-bold">Dry Bulb, Dew Point, Solar Rad (W/m²), Wind</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">WBGT CALCULATION</div>
                      <div className="text-[#FFB800] font-bold">0.7 T_nw + 0.2 T_g + 0.1 T_d</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">OUTPUT METRIC</div>
                      <div className="text-white font-bold">PWC Loss (%) & Max Work-Rest Regimen</div>
                    </div>
                  </div>
                </div>
              )}

              {activeModelTab === 'C' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-[#10B981] font-bold uppercase">
                        HYDRATION ENGINE • MODEL C
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white uppercase mt-1">
                        Acute Sweat Loss & Electrolyte Depletion Modeling
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-[#10B981] font-bold">
                      TARGET: &lt; 2% BODY MASS DEFICIT
                    </div>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                    Estimates hourly evaporative sweat volume as a function of cardiac output, ambient water vapor pressure, and body surface area. Provides individual-level fluid and sodium replenishment volume requirements before acute kidney injury or cramping occurs.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">BIOPHYSICAL INPUTS</div>
                      <div className="text-white font-bold">Body Mass (kg), Duration, Exertion Level</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">SWEAT LOSS CALCULATION</div>
                      <div className="text-[#10B981] font-bold">Liters/Hour Evaporative Rate</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">RECOMMENDED ACTION</div>
                      <div className="text-white font-bold">Specific mL Fluid & Electrolyte Rest Schedule</div>
                    </div>
                  </div>
                </div>
              )}

              {activeModelTab === 'D' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-purple-400 font-bold uppercase">
                        STATISTICAL RELIABILITY • MODEL D
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white uppercase mt-1">
                        Distribution-Free Conformal Uncertainty Intervals
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-purple-400 font-bold">
                      CERTIFIED 95% COVERAGE
                    </div>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                    Every temperature estimate includes non-parametric conformal prediction intervals. Prevents alarm fatigue from noisy Bluetooth sensor drops while mathematically bounding the true physiological state, so field supervisors only intervene on genuine threats.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">CALIBRATION PROTOCOL</div>
                      <div className="text-white font-bold">Split-Conformal Empirical Residuals</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">GUARANTEED COVERAGE</div>
                      <div className="text-purple-400 font-bold">1 - alpha (90% & 95% Intervals)</div>
                    </div>
                    <div className="border border-white/10 bg-[#0D0F12] p-4">
                      <div className="text-white/40 uppercase mb-1">BENEFIT</div>
                      <div className="text-white font-bold">Zero False Alarms from Motion Artifacts</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DATA PIPELINE & ARCHITECTURE */}
        <section id="architecture" className="px-6 lg:px-12 py-20 border-b border-white/10 bg-[#101317]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
              <span>03 // PIPELINE ARCHITECTURE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Edge-to-Cloud Telemetry Flow
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl text-base">
              Engineered for low latency, zero-install browser operation, and fault-tolerant local edge execution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 font-mono text-xs">
              <div className="border border-white/10 bg-[#14171C] p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[#244CFF] font-bold mb-2">STEP 01 // WEARABLE</div>
                  <div className="text-white font-bold text-sm mb-2">Web Bluetooth GATT</div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Browser directly pairs with commercial BLE devices via standard 0x180D (Heart Rate) and 0x1809 (Health Thermometer) services.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/40">
                  NO APP INSTALL REQUIRED
                </div>
              </div>

              <div className="border border-white/10 bg-[#14171C] p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[#FFB800] font-bold mb-2">STEP 02 // WEATHER</div>
                  <div className="text-white font-bold text-sm mb-2">Open-Meteo GPS Sync</div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Fetches microclimate arrays (temperature, relative humidity, solar irradiance, wind speed) from global satellite grids.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/40">
                  SUB-KILOMETER RESOLUTION
                </div>
              </div>

              <div className="border border-white/10 bg-[#14171C] p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[#10B981] font-bold mb-2">STEP 03 // ENGINE</div>
                  <div className="text-white font-bold text-sm mb-2">FastAPI Inference</div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Evaluates multi-modal physiological vectors through Model A and generates conformal confidence intervals under 15ms.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/40">
                  RATE-LIMITED & ASYNC
                </div>
              </div>

              <div className="border border-white/10 bg-[#14171C] p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[#E72D49] font-bold mb-2">STEP 04 // DISPATCH</div>
                  <div className="text-white font-bold text-sm mb-2">ISO 7243 Escalation</div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Triggers high-priority visual alarms, logs incidents into the database audit trail, and computes mandated cooling periods.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/40">
                  AUDITED INCIDENT LOG
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STANDARDS & REGULATIONS */}
        <section id="standards" className="px-6 lg:px-12 py-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#10B981] mb-3">
              <Shield className="h-3.5 w-3.5" />
              <span>04 // OCCUPATIONAL COMPLIANCE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Calibrated Against International Standards
            </h2>
            <p className="mt-3 text-white/60 max-w-2xl text-base">
              ThermoSense risk matrices and automated rest regimes adhere to established industrial regulatory frameworks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              <div className="border border-white/10 bg-[#14171C] p-6">
                <div className="text-xs font-mono uppercase text-white/40 mb-1">FRAMEWORK 01</div>
                <div className="text-lg font-display font-bold text-white uppercase mb-2">
                  ISO 7243:2017
                </div>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Hot environments assessment based on the WBGT index and standard metabolic work rate allocations.
                </p>
              </div>

              <div className="border border-white/10 bg-[#14171C] p-6">
                <div className="text-xs font-mono uppercase text-white/40 mb-1">FRAMEWORK 02</div>
                <div className="text-lg font-display font-bold text-white uppercase mb-2">
                  OSHA 29 CFR 1910
                </div>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Compliance with the General Duty Clause and proposed federal heat injury prevention standard.
                </p>
              </div>

              <div className="border border-white/10 bg-[#14171C] p-6">
                <div className="text-xs font-mono uppercase text-white/40 mb-1">FRAMEWORK 03</div>
                <div className="text-lg font-display font-bold text-white uppercase mb-2">
                  NIOSH Criteria
                </div>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Pub No. 2016-106 recommendations for heat stress limits, hydration replacement, and acclimatization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="px-6 lg:px-12 py-20 bg-[#14171C]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight">
              Ready for Operational Deployment
            </h2>
            <p className="mt-4 text-white/70 max-w-xl mx-auto text-base">
              Open the live monitoring console to evaluate real-time worker vitals, stream microclimate telemetry, and manage active incident alerts.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-10 py-5 flex items-center justify-center gap-3 border border-[#244CFF] transition-all"
              >
                <span>OPEN HEAT-HEALTH DASHBOARD</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0D0F12] px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white tracking-wider">THERMOSENSE AI</span>
              <span className="text-white/20">•</span>
              <span>Occupational Heat-Health & Thermal Safety Surveillance</span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Live Console
              </Link>
              <button
                onClick={() => openLegalWithTab('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openLegalWithTab('terms')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => openLegalWithTab('cookies')}
                className="hover:text-white transition-colors"
              >
                Cookies & Storage
              </button>
              <button
                onClick={() => openLegalWithTab('data-deletion')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Data Erasure
              </button>
              <a
                href={apiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                API Docs
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/30 gap-2">
            <span>Calibrated against ISO 7243:2017 & OSHA 29 CFR 1910 standards. Not a medical diagnostic substitute.</span>
            <span>© 2026 THERMOSENSE • Zero Advertising Trackers</span>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        defaultTab={legalTab}
      />
    </div>
  );
}
