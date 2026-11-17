'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TelemetryConsole } from '@/components/TelemetryConsole';
import { EnvironmentalView } from '@/components/EnvironmentalView';
import { HydrationStation } from '@/components/HydrationStation';
import { WorkerRoster } from '@/components/WorkerRoster';
import { AlertsDrawer } from '@/components/AlertsDrawer';
import { LegalModal } from '@/components/LegalModal';
import { api } from '@/lib/api';
import { SafetyAlert } from '@/types/api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'telemetry' | 'environmental' | 'hydration' | 'workers'
  >('telemetry');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cookies' | 'data-deletion'>('privacy');

  const openLegalWithTab = (tab: 'privacy' | 'terms' | 'cookies' | 'data-deletion') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  // Poll system health & active alerts
  const checkHealthAndAlerts = async () => {
    try {
      await api.getHealth();
      setBackendOnline(true);
      const active = await api.getActiveAlerts();
      setAlerts(active);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkHealthAndAlerts();
    const interval = setInterval(checkHealthAndAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      checkHealthAndAlerts();
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      await api.clearAllAlerts();
      setAlerts([]);
    } catch (err) {
      console.error('Failed to clear alerts:', err);
      checkHealthAndAlerts();
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#E8EBED] flex flex-col justify-between">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          activeAlertCount={alerts.length}
          openAlertsDrawer={() => setIsAlertsOpen(true)}
          backendOnline={backendOnline}
        />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {activeTab === 'telemetry' && (
            <TelemetryConsole
              privacyMode={privacyMode}
              onAlertTriggered={checkHealthAndAlerts}
            />
          )}
          {activeTab === 'environmental' && <EnvironmentalView />}
          {activeTab === 'hydration' && <HydrationStation />}
          {activeTab === 'workers' && <WorkerRoster privacyMode={privacyMode} />}
        </main>
      </div>

      {/* Slide-Over Incidents Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
        onClearAll={handleClearAllAlerts}
      />

      {/* Global Clinical & Occupational Disclaimer Footer */}
      <footer className="border-t border-white/10 bg-[#0D0F12] px-4 lg:px-8 py-5 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-mono text-white/40 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/60">THERMOSENSE</span>
            <span>• Occupational Heat-Health Early Warning Prototype</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => openLegalWithTab('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => openLegalWithTab('terms')}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => openLegalWithTab('cookies')}
              className="hover:text-white transition-colors"
            >
              Storage
            </button>
            <button
              onClick={() => openLegalWithTab('data-deletion')}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Purge Cache
            </button>
            <span className="text-white/20">|</span>
            <span>Not a diagnostic medical device</span>
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
