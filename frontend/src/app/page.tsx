'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TelemetryConsole } from '@/components/TelemetryConsole';
import { EnvironmentalView } from '@/components/EnvironmentalView';
import { HydrationStation } from '@/components/HydrationStation';
import { WorkerRoster } from '@/components/WorkerRoster';
import { AlertsDrawer } from '@/components/AlertsDrawer';
import { api } from '@/lib/api';
import { SafetyAlert } from '@/types/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'telemetry' | 'environmental' | 'hydration' | 'workers'
  >('telemetry');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

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
    }
  };

  return (
    <div className="min-h-screen bg-[var(--carbon-base)] text-[var(--porcelain)] flex flex-col justify-between">
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
      />

      {/* Global Clinical & Occupational Disclaimer Footer */}
      <footer className="border-t border-[var(--carbon-border)] bg-[var(--carbon-surface)] px-4 lg:px-8 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-2">
          <span>ThermoSense AI • Occupational Heat-Health Early Warning Prototype</span>
          <span>Not a diagnostic medical device • Strictly for workplace heat-stress surveillance</span>
        </div>
      </footer>
    </div>
  );
}
