'use client';

import React from 'react';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';

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
    <header className="border-b border-white/10 bg-[#0D0F12] sticky top-0 z-50 px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Clean Brand Lockup - Just THERMOSENSE */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-tight text-white uppercase font-display">
            THERMOSENSE
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono text-white/40 ml-2">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                backendOnline ? 'bg-[#10B981]' : 'bg-[#E72D49]'
              }`}
            />
            <span>{backendOnline ? 'Live' : 'Offline'}</span>
          </span>
        </div>

        {/* Clean Tab Switcher - Simple Human Labels */}
        <div className="flex items-center gap-1 bg-[#14171C] border border-white/10 p-1">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'telemetry'
                ? 'bg-[#244CFF] text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('environmental')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'environmental'
                ? 'bg-[#244CFF] text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Environment
          </button>
          <button
            onClick={() => setActiveTab('hydration')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'hydration'
                ? 'bg-[#244CFF] text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Hydration
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'workers'
                ? 'bg-[#244CFF] text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Workers
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 text-xs font-mono uppercase flex items-center gap-2 border transition-all ${
              privacyMode
                ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10'
                : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            {privacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>Privacy {privacyMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={openAlertsDrawer}
            className={`px-4 py-2 text-xs font-mono uppercase font-bold flex items-center gap-2 transition-all ${
              activeAlertCount > 0
                ? 'bg-[#E72D49] text-white'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Alerts ({activeAlertCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
