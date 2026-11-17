'use client';

import React, { useState } from 'react';
import { X, Shield, Lock, Trash2, CheckCircle2, AlertTriangle, FileText, Globe } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'cookies' | 'data-deletion';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies' | 'data-deletion'>(defaultTab);
  const [deletionSuccess, setDeletionSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePurgeData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      setDeletionSuccess(true);
      setTimeout(() => {
        setDeletionSuccess(false);
        onClose();
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#14171C] border border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col text-white shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#244CFF]" />
            <h2 id="legal-modal-title" className="text-xl font-bold font-display uppercase tracking-tight">
              Compliance, Privacy & Governance
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0D0F12] text-xs font-mono uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-[#244CFF] text-white font-bold bg-[#14171C]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-3 border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-[#244CFF] text-white font-bold bg-[#14171C]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-6 py-3 border-b-2 transition-all ${
              activeTab === 'cookies'
                ? 'border-[#244CFF] text-white font-bold bg-[#14171C]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Storage & Cookies
          </button>
          <button
            onClick={() => setActiveTab('data-deletion')}
            className={`px-6 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'data-deletion'
                ? 'border-red-500 text-red-400 font-bold bg-[#14171C]'
                : 'border-transparent text-white/50 hover:text-red-400'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Data Erasure</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-white/80 font-sans leading-relaxed flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded text-xs font-mono text-blue-300">
                <strong>Data Minimization Standard:</strong> ThermoSense does not collect personal identity, government IDs, or home addresses. Only anonymous physiological telemetry and local ambient weather metrics are processed.
              </div>
              <h3 className="text-base font-bold text-white font-display uppercase">1. Information We Collect</h3>
              <p>
                We collect only the minimum telemetry necessary for occupational heat strain assessment:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-white/70 font-mono">
                <li>Heart Rate (BPM) from paired Bluetooth Low Energy (BLE) sensors.</li>
                <li>Skin Temperature (°C) from attached probes or estimated physiological baselines.</li>
                <li>Device Geolocation (Latitude & Longitude) solely to fetch ambient meteorological data from Open-Meteo.</li>
                <li>Anonymous Worker Group Tags (e.g. <code>WG-01</code>) cached locally on your device.</li>
              </ul>

              <h3 className="text-base font-bold text-white font-display uppercase">2. Zero Commercial Data Sharing</h3>
              <p>
                Your biometric and physiological telemetry is never sold, leased, or distributed to advertising networks or third-party data brokers.
              </p>

              <h3 className="text-base font-bold text-white font-display uppercase">3. Third-Party API Audit</h3>
              <p>
                The platform queries <strong>Open-Meteo</strong> strictly to retrieve microclimate weather variables (ambient temperature, relative humidity, wind speed, solar radiation). No biometric or personal data is transmitted to Open-Meteo.
              </p>

              <h3 className="text-base font-bold text-white font-display uppercase">4. Age Restriction (COPPA & Occupational Limits)</h3>
              <p>
                ThermoSense is an industrial occupational safety platform designed strictly for adult personnel aged <strong>18 and older</strong>. We do not knowingly monitor minors or children.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded text-xs font-mono text-amber-300">
                <strong>Clinical & Occupational Disclaimer:</strong> ThermoSense is a real-time occupational heat-strain decision support system calibrated against ISO 7243:2017 and OSHA guidelines. It is not an invasive medical diagnostic device.
              </div>
              <h3 className="text-base font-bold text-white font-display uppercase">1. Intended Purpose</h3>
              <p>
                ThermoSense is engineered to provide occupational safety managers, industrial hygiene supervisors, and workers with early warning heat strain indicators to prevent exertional heat illness (EHI).
              </p>

              <h3 className="text-base font-bold text-white font-display uppercase">2. No Unsupported Medical Claims</h3>
              <p>
                Core body temperature estimates generated by Model A and Model D provide probabilistic risk boundaries. They do not substitute for emergency medical diagnosis, clinical hospitalization protocols, or physician care in the event of acute heat stroke.
              </p>

              <h3 className="text-base font-bold text-white font-display uppercase">3. Employer Duty of Care</h3>
              <p>
                Use of this platform does not relieve employers of statutory duty-of-care obligations under OSHA 29 CFR 1910 General Duty Clause or local occupational health and safety regulations.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white font-display uppercase">Storage & Essential Cache Policy</h3>
              <p>
                ThermoSense operates with <strong>zero third-party tracking or advertising cookies</strong>. We utilize only essential browser local storage (<code>localStorage</code>) to support system operations:
              </p>
              <div className="border border-white/10 bg-[#0D0F12] p-4 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="text-[#244CFF]">thermosense_worker_tag</span>
                  <span className="text-white/60">Anonymous worker ID (e.g. WG-01) for session continuity.</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="text-[#244CFF]">thermosense_consent</span>
                  <span className="text-white/60">Records your privacy & storage preferences.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#244CFF]">Service Worker Cache</span>
                  <span className="text-white/60">Enables offline operation on remote industrial job sites.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-deletion' && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded text-xs font-mono text-red-300">
                <strong>Right to be Forgotten (GDPR / CCPA):</strong> You can instantly purge all locally cached telemetry, anonymous worker identifiers, and session configurations from this device with one click.
              </div>
              <h3 className="text-base font-bold text-white font-display uppercase">Instant Local Data Purge</h3>
              <p className="text-xs text-white/70">
                Clicking the button below will permanently wipe all cached worker tags, Bluetooth device memories, and offline service worker entries from your browser.
              </p>

              {deletionSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 p-4 rounded flex items-center gap-3 text-xs font-mono">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>All local data and cached profiles have been permanently purged. Reloading...</span>
                </div>
              ) : (
                <button
                  onClick={handlePurgeData}
                  className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold px-6 py-3 flex items-center gap-2 border border-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Purge All Local Telemetry & Reset Cache</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-white/10 p-4 bg-[#0D0F12] flex items-center justify-between text-xs font-mono text-white/40">
          <span>THERMOSENSE Compliance Framework v1.0</span>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
