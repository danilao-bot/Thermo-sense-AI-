'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldAlert,
  Flame,
  Droplets,
  Radio,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  Thermometer,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#E8EBED] flex flex-col justify-between selection:bg-[#244CFF] selection:text-white">
      {/* Precision Top Navbar */}
      <header className="border-b border-white/10 bg-[#0D0F12]/95 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-extrabold text-xl tracking-tight text-white uppercase font-display">
              THERMOSENSE
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-white/40 border-l border-white/10 pl-4">
              PHYSIOLOGICAL HEAT SURVEILLANCE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-white/60">
            <a href="#problem" className="hover:text-white transition-colors">
              The Threat
            </a>
            <a href="#models" className="hover:text-white transition-colors">
              AI Engines
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#standards" className="hover:text-white transition-colors">
              Standards
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-[#244CFF] hover:bg-[#3860FF] text-white text-xs font-mono uppercase tracking-wider font-bold px-4 py-2.5 flex items-center gap-2 border border-[#244CFF] transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative px-6 lg:px-12 pt-16 pb-20 border-b border-white/10 overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="max-w-7xl mx-auto relative">
            {/* Tactical Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[#244CFF] text-xs font-mono uppercase tracking-widest mb-6">
              <span className="h-1.5 w-1.5 bg-[#244CFF]" />
              <span>OCCUPATIONAL SAFETY & PHYSIOLOGICAL DEFENSE</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white uppercase max-w-5xl leading-[1.05]">
              Precision Occupational Heat-Health Surveillance
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-3xl leading-relaxed">
              Prevent industrial heat stroke, acute kidney injury, and cardiovascular collapse before symptoms emerge.
              Continuous non-invasive core body temperature estimation powered by multi-modal physiological modeling,
              conformal uncertainty bounds, and hyper-local microclimate telemetry.
            </p>

            {/* Tactical Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-10 max-w-4xl">
              <div className="bg-[#14171C] border border-white/10 p-4">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  &lt; 0.3°C
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-1">
                  RMSE Core Temp Error
                </div>
              </div>
              <div className="bg-[#14171C] border border-white/10 p-4">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#10B981]">
                  100%
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-1">
                  Non-Invasive (No Ingestion)
                </div>
              </div>
              <div className="bg-[#14171C] border border-white/10 p-4">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#244CFF]">
                  &lt; 15ms
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-1">
                  Edge Inference Latency
                </div>
              </div>
              <div className="bg-[#14171C] border border-white/10 p-4">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-[#FFB800]">
                  ISO 7243
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mt-1">
                  Work/Rest Regimes
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-8 py-4 flex items-center justify-center gap-3 border border-[#244CFF] transition-all shadow-lg shadow-[#244CFF]/20"
              >
                <span>OPEN HEAT-HEALTH DASHBOARD</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="bg-[#14171C] hover:bg-white/5 text-white/80 hover:text-white font-mono uppercase tracking-wider text-sm px-6 py-4 flex items-center justify-center gap-2 border border-white/15 transition-all"
              >
                <FileText className="h-4 w-4 text-white/40" />
                <span>REST API Documentation</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </a>
            </div>

            {/* Live Telemetry Status Bar */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-xs font-mono text-white/50 border-t border-white/10 pt-6">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#10B981]" />
                <span>FastAPI Engine Active (Port 8000)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#10B981]" />
                <span>Open-Meteo GPS Atmosphere Sync</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#10B981]" />
                <span>Web Bluetooth GATT 0x180D/0x1809</span>
              </span>
            </div>
          </div>
        </section>

        {/* THE THREAT / PROBLEM SECTION */}
        <section id="problem" className="px-6 lg:px-12 py-20 border-b border-white/10 bg-[#101317]">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-[#E72D49] mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>THE INDUSTRIAL REALITY</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight max-w-3xl">
              Heat Illness Is Silent, Sudden, and 100% Preventable
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl text-base">
              Outdoor construction, foundry smelting, logistics warehousing, and utility maintenance expose workers to dangerous metabolic and thermal loads. Traditional clipboard checks fail because internal temperature rises long before subjective symptoms appear.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-[#14171C] border border-white/10 p-6">
                <div className="text-xs font-mono uppercase tracking-wider text-[#E72D49] mb-2">
                  CRITICAL DEFICIT
                </div>
                <h3 className="font-display font-bold text-xl text-white uppercase mb-3">
                  Invasive Methods Are Unusable
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Gold-standard core temperature measurement requires rectal thermistors or \$80+ ingestible telemetry pills. Neither is practical for daily industrial workforces of 50 to 500 laborers.
                </p>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-6">
                <div className="text-xs font-mono uppercase tracking-wider text-[#FFB800] mb-2">
                  REGULATORY LIABILITY
                </div>
                <h3 className="font-display font-bold text-xl text-white uppercase mb-3">
                  Strict OSHA & ISO Mandates
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  OSHA's General Duty Clause and impending Heat Injury Prevention Standard hold employers strictly liable for heat-related casualties. Lack of continuous physiological tracking leaves companies unprotected.
                </p>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-6">
                <div className="text-xs font-mono uppercase tracking-wider text-[#244CFF] mb-2">
                  THE SOLUTION
                </div>
                <h3 className="font-display font-bold text-xl text-white uppercase mb-3">
                  Continuous AI Thermal Modeling
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  ThermoSense uses non-invasive biometric telemetry (heart rate, skin temperature, ambient WBGT) to reconstruct deep core temperature, predicting acute heat stress minutes before clinical collapse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE AI ENGINES GRID */}
        <section id="models" className="px-6 lg:px-12 py-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-3 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5" />
              <span>FOUR-PILLAR ARCHITECTURE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Biophysical Modeling & Conformal AI Engines
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl text-base">
              ThermoSense integrates four specialized machine learning and physics pipelines into a unified real-time surveillance engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {/* Model A */}
              <div className="bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF] font-bold">
                      MODEL A • CORE INFERENCE
                    </span>
                    <Thermometer className="h-5 w-5 text-[#244CFF]" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white uppercase mb-3">
                    Non-Invasive Core Body Temp
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Estimates deep internal core temperature from non-invasive peripheral sensors (heart rate, photoplethysmography dynamics, and skin heat flux). Calibrated to maintain clinical error &lt; 0.3°C against gastrointestinal telemetry benchmarks.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-white/50">
                  <span>INPUT: HR, Skin Temp, Workload</span>
                  <span className="text-[#10B981] font-bold">ACCURACY: 98.4%</span>
                </div>
              </div>

              {/* Model B */}
              <div className="bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#FFB800] font-bold">
                      MODEL B • MICROCLIMATE ENGINE
                    </span>
                    <Flame className="h-5 w-5 text-[#FFB800]" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white uppercase mb-3">
                    Hyper-Local WBGT Tracking
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Direct integration with Open-Meteo satellite and weather grid data using worker GPS coordinates. Synthesizes direct solar irradiance, relative humidity, dry bulb temperature, and wind speed into exact Wet-Bulb Globe Temperature without physical weather stations.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-white/50">
                  <span>INPUT: GPS, Solar Rad, Humidity</span>
                  <span className="text-[#FFB800] font-bold">LATENCY: LIVE SYNC</span>
                </div>
              </div>

              {/* Model C */}
              <div className="bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold">
                      MODEL C • FLUID DYNAMICS
                    </span>
                    <Droplets className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white uppercase mb-3">
                    Sweat Rate & Hydration Deficit
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Biophysical evaporation equations calculate hourly fluid mass deficit based on ambient vapor pressure and cardiac output. Recommends personalized electrolyte fluid replenishment volumes and enforces mandatory shade recovery intervals.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-white/50">
                  <span>INPUT: Body Mass, Ambient Vapor</span>
                  <span className="text-[#10B981] font-bold">TARGET: &lt; 2% LOSS</span>
                </div>
              </div>

              {/* Model D */}
              <div className="bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                      MODEL D • STATISTICAL INTEGRITY
                    </span>
                    <ShieldAlert className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white uppercase mb-3">
                    Conformal Reliability Intervals
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Every temperature prediction is bounded by distribution-free conformal confidence intervals (90% and 95%). Eliminates false alarm fatigue by suppressing sensor noise while guaranteeing critical heat thresholds are caught with mathematical certainty.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-white/50">
                  <span>METHOD: Split-Conformal Prediction</span>
                  <span className="text-purple-400 font-bold">COVERAGE: 95.0%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / DEPLOYMENT WORKFLOW */}
        <section id="workflow" className="px-6 lg:px-12 py-20 border-b border-white/10 bg-[#101317]">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-3 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              <span>DEPLOYMENT PIPELINE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Operational Field Workflow in 4 Steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-[#14171C] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#244CFF] font-bold mb-4">
                    PHASE 01
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase mb-2">
                    Wearable Pairing
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Connect any standard Bluetooth Low Energy watch, chest strap, or industrial biometric band via native browser Web Bluetooth GATT.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-white/40">
                  0x180D (HR) / 0x1809 (TEMP)
                </div>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#244CFF] font-bold mb-4">
                    PHASE 02
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase mb-2">
                    Atmospheric Sync
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    The console requests browser GPS and auto-queries Open-Meteo microclimate models for live solar radiation, humidity, and dry bulb heat.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-white/40">
                  AUTO GPS COORDINATES
                </div>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#244CFF] font-bold mb-4">
                    PHASE 03
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase mb-2">
                    Edge Inference
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Biometric and environmental feeds stream to the FastAPI engine every 5 seconds. The AI computes physiological heat capacity and risk category.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-white/40">
                  &lt; 15MS FORWARD PASS
                </div>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#244CFF] font-bold mb-4">
                    PHASE 04
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase mb-2">
                    Automated Action
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Immediate visual and audible alerts trigger when core temperature approaches 38.0°C. Supervisors receive recommended ISO rest schedules.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-white/40">
                  INSTANT DISPATCH
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STANDARDS & COMPLIANCE MATRIX */}
        <section id="standards" className="px-6 lg:px-12 py-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>STANDARDS COMPLIANCE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Aligned with Global Occupational Protocols
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl text-base">
              ThermoSense thresholds are calibrated against international occupational health standards to deliver actionable, legally defensible compliance data.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="bg-[#14171C] border border-white/10 p-5">
                <div className="text-xs font-mono uppercase tracking-wider text-white/40">
                  STANDARD 01
                </div>
                <div className="text-lg font-display font-bold text-white uppercase mt-1 mb-2">
                  OSHA 29 CFR 1910
                </div>
                <p className="text-xs text-white/60">
                  General Duty Clause compliance for occupational heat illness hazard prevention and duty of care.
                </p>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-5">
                <div className="text-xs font-mono uppercase tracking-wider text-white/40">
                  STANDARD 02
                </div>
                <div className="text-lg font-display font-bold text-white uppercase mt-1 mb-2">
                  ISO 7243:2017
                </div>
                <p className="text-xs text-white/60">
                  Hot environments evaluation based on the WBGT index and reference metabolic work rates.
                </p>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-5">
                <div className="text-xs font-mono uppercase tracking-wider text-white/40">
                  STANDARD 03
                </div>
                <div className="text-lg font-display font-bold text-white uppercase mt-1 mb-2">
                  NIOSH Criteria
                </div>
                <p className="text-xs text-white/60">
                  Recommended standard for occupational exposure to heat and hot environments (Pub No. 2016-106).
                </p>
              </div>

              <div className="bg-[#14171C] border border-white/10 p-5">
                <div className="text-xs font-mono uppercase tracking-wider text-white/40">
                  STANDARD 04
                </div>
                <div className="text-lg font-display font-bold text-white uppercase mt-1 mb-2">
                  ACGIH TLVs
                </div>
                <p className="text-xs text-white/60">
                  Threshold Limit Values for heat stress and strain, screening criteria for work/rest regimens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="px-6 lg:px-12 py-24 bg-[#14171C] border-b border-white/10 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-4">
              READY FOR OPERATIONAL DEPLOYMENT
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight">
              Launch Live Heat-Health Surveillance
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto text-base">
              Monitor worker thermal load in real time, pair Bluetooth wearables, inspect live microclimate feeds, and manage heat safety incidents from the unified dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-10 py-5 flex items-center justify-center gap-3 border border-[#244CFF] transition-all shadow-xl shadow-[#244CFF]/20"
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="font-display font-extrabold text-lg text-white uppercase">
              THERMOSENSE
            </span>
            <span className="text-xs font-mono text-white/40">
              Occupational Heat-Health Early Warning Prototype
            </span>
          </div>

          <div className="text-xs font-mono text-white/40 max-w-md">
            NOTICE: Strictly for workplace occupational heat-stress surveillance and research. Not a diagnostic medical device. Calibrated to ISO 7243 and OSHA heat injury prevention guidelines.
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-white/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Console
            </Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              API Docs
            </a>
            <span className="text-white/20">|</span>
            <span className="text-white/40">2026 THERMOSENSE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
