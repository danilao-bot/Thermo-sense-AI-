'use client';

import React from 'react';
import {
  Activity,
  CloudSun,
  Droplets,
  Users,
  ShieldAlert,
  Eye,
  EyeOff,
  Server,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'telemetry' | 'environmental' | 'hydration' | 'workers';
  setActiveTab: (tab: 'telemetry' | 'environmental' | 'hydration' | 'workers') => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean) => void;
  activeAlertCount: number;
  openAlertsDrawer: () => void;
  backendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  privacyMode,
  setPrivacyMode,
  activeAlertCount,
  openAlertsDrawer,
  backendOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--carbon-surface)] border-b border-[var(--carbon-border)] px-4 lg:px-8 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[var(--ultramarine)] flex items-center justify-center shadow-inner">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-[var(--porcelain)]">
                ThermoSense <span className="text-[var(--ultramarine)]">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] text-[var(--vanilla-cream)]">
                Industrial Heat-Health
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  backendOnline ? 'bg-[var(--neon-jade)] animate-pulse' : 'bg-[var(--cherry-red)]'
                }`}
              />
              <span className="font-mono text-[11px]">
                {backendOnline ? 'SYSTEM CONNECTED (127.0.0.1:8000)' : 'BACKEND OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[var(--carbon-base)] p-1 rounded-xl border border-[var(--carbon-border)]">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'telemetry'
                ? 'bg-[var(--ultramarine)] text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-[var(--carbon-elevated)]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Telemetry Console</span>
          </button>

          <button
            onClick={() => setActiveTab('environmental')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'environmental'
                ? 'bg-[var(--ultramarine)] text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-[var(--carbon-elevated)]'
            }`}
          >
            <CloudSun className="h-3.5 w-3.5" />
            <span>Mode B Environmental</span>
          </button>

          <button
            onClick={() => setActiveTab('hydration')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'hydration'
                ? 'bg-[var(--ultramarine)] text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-[var(--carbon-elevated)]'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Hydration Station</span>
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workers'
                ? 'bg-[var(--ultramarine)] text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-[var(--carbon-elevated)]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Worker Roster</span>
          </button>
        </nav>

        {/* Utility Actions: Privacy Mode + Incident Alert Drawer Trigger */}
        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              privacyMode
                ? 'border-[var(--neon-jade)] text-[var(--neon-jade)] bg-[var(--neon-jade)]/10'
                : 'border-[var(--carbon-border)] text-neutral-400 hover:text-white hover:bg-[var(--carbon-elevated)]'
            }`}
            title="Privacy Mode masks worker names to badge numbers on display"
          >
            {privacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Privacy: {privacyMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Incident Drawer Button */}
          <button
            onClick={openAlertsDrawer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all relative ${
              activeAlertCount > 0
                ? 'bg-[var(--cherry-red)] text-white border-[var(--cherry-red)] shadow-[0_0_12px_var(--cherry-red-glow)] animate-pulse'
                : 'bg-[var(--carbon-elevated)] text-[var(--porcelain)] border-[var(--carbon-border)] hover:bg-[var(--carbon-border)]'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Safety Alerts</span>
            {activeAlertCount > 0 && (
              <span className="ml-1 bg-white text-[var(--cherry-red)] text-[10px] font-bold px-1.5 rounded-full">
                {activeAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
