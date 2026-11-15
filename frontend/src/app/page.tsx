'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#E8EBED] flex flex-col justify-between selection:bg-[#244CFF] selection:text-white">
      {/* Precision Top Navbar - Clean, No Tags */}
      <header className="border-b border-white/10 bg-[#0D0F12] sticky top-0 z-50 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-extrabold text-xl tracking-tight text-white uppercase font-display"
          >
            THERMOSENSE
          </Link>

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

      <main className="flex-1 max-w-5xl mx-auto px-6 lg:px-12 py-16 sm:py-24">
        {/* HERO - Clean Editorial Typography, No Clutter Cards */}
        <section className="mb-20">
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white uppercase leading-[1.05]">
            Precision Occupational Heat-Health Surveillance
          </h1>

          <p className="mt-8 text-lg sm:text-2xl text-white/80 leading-relaxed max-w-4xl">
            Prevent industrial heat stroke, acute kidney injury, and cardiovascular collapse before symptoms emerge. Continuous non-invasive core body temperature estimation powered by multi-modal physiological modeling, conformal uncertainty bounds, and hyper-local microclimate telemetry.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/dashboard"
              className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-8 py-4 flex items-center justify-center gap-3 border border-[#244CFF] transition-all"
            >
              <span>OPEN HEAT-HEALTH DASHBOARD</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-mono uppercase tracking-wider text-sm px-6 py-4 flex items-center justify-center gap-2 border border-white/20 transition-all"
            >
              <span>API Documentation</span>
              <ExternalLink className="h-3.5 w-3.5 text-white/40" />
            </a>
          </div>
        </section>

        {/* THE PROBLEM & SOLUTION - Clean Text Narrative */}
        <section className="py-16 border-t border-white/10 space-y-12">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">
              01 // The Problem
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Heat Illness Is Silent, Rapid, and Preventable
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              Industrial laborers in construction, manufacturing, and utilities face hazardous thermal environments. Gold-standard core temperature monitoring has historically required invasive rectal thermistors or expensive ingestible sensor pills—both impossible for daily operational deployment. By the time a worker experiences dizziness or nausea, critical heat exhaustion is already underway.
            </p>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#244CFF] mb-2">
              02 // The Solution
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Continuous Biophysical Edge Inference
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed">
              ThermoSense bridges the gap by translating non-invasive biometric telemetry (standard wearable heart rate and skin temperature) into certified core body temperature estimates, paired with live Open-Meteo weather intelligence and automated hydration deficit guidance.
            </p>
          </div>
        </section>

        {/* THE FOUR AI ENGINES - Clean Text Layout */}
        <section className="py-16 border-t border-white/10 space-y-10">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">
            03 // The AI Engines
          </div>

          <div className="space-y-8">
            <div className="border-l-2 border-[#244CFF] pl-6">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase">
                Model A: Non-Invasive Core Body Temperature
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                Dual-sensor thermal energy balance modeling trained on human environmental chamber trials. Reconstructs deep internal temperature dynamics in real time with an error below 0.3°C RMSE against gastrointestinal benchmarks.
              </p>
            </div>

            <div className="border-l-2 border-[#FFB800] pl-6">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase">
                Model B: Microclimate & Wet-Bulb Globe Temperature
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                Automated GPS atmospheric synchronization using Open-Meteo high-resolution models. Computes ambient solar radiation, relative humidity, wind vector, and WBGT index without requiring dedicated on-site meteorological towers.
              </p>
            </div>

            <div className="border-l-2 border-[#10B981] pl-6">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase">
                Model C: Sweat Loss & Hydration Deficit
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                Physics-based mass loss estimation modeling evaporative sweat rates under varying clothing insulation and metabolic workloads. Computes personalized electrolyte fluid replenishment volumes to prevent acute kidney strain.
              </p>
            </div>

            <div className="border-l-2 border-purple-400 pl-6">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase">
                Model D: Conformal Uncertainty Bounds
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
                Distribution-free conformal prediction delivering mathematically guaranteed 90% and 95% confidence intervals. Filters transient biometric noise while ensuring high-risk threshold breaches trigger instant supervisor dispatch.
              </p>
            </div>
          </div>
        </section>

        {/* STANDARDS & PROTOCOLS - Clean Text */}
        <section className="py-16 border-t border-white/10 space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">
            04 // Regulatory Compliance
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
            Built for OSHA, ISO 7243 & NIOSH Standards
          </h2>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">
            All safety thresholds, rest rotation formulas, and WBGT exposure indices are calibrated directly against ISO 7243:2017 hot environment screening protocols, OSHA 29 CFR 1910 general duty criteria, and NIOSH occupational heat stress standards.
          </p>
        </section>

        {/* FINAL LAUNCH CALL TO ACTION */}
        <section className="pt-16 pb-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase">
                Launch Live Operational Console
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Ready to monitor telemetry, pair wearables, and review live workers.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-mono uppercase tracking-wider font-bold text-sm px-8 py-4 flex items-center justify-center gap-3 border border-[#244CFF] transition-all self-start sm:self-auto"
            >
              <span>OPEN HEAT-HEALTH DASHBOARD</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER - Minimal, No Disclaimer Clutter */}
      <footer className="border-t border-white/10 bg-[#0D0F12] px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <span className="font-bold text-white/60">THERMOSENSE</span>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              API Docs
            </a>
            <span>2026 THERMOSENSE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
