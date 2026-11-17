'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, X } from 'lucide-react';
import { LegalModal } from './LegalModal';

export const ConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'cookies' | 'data-deletion'>('privacy');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('thermosense_consent');
      if (!consent) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('thermosense_consent', 'accepted');
    }
    setShowBanner(false);
  };

  const openLegalModalWithTab = (tab: 'privacy' | 'terms' | 'cookies' | 'data-deletion') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  if (!showBanner) {
    return (
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultTab={legalModalTab}
      />
    );
  }

  return (
    <>
      <aside
        aria-label="Consent and Data Governance Banner"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#14171C]/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-8 py-4 text-xs font-mono text-white shadow-2xl transition-all"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Shield className="h-5 w-5 text-[#244CFF] shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-white/80 leading-relaxed text-[11px] sm:text-xs">
              <span className="text-white font-bold uppercase tracking-wider">Privacy & Telemetry Consent:</span>{' '}
              ThermoSense uses essential local storage for anonymous worker IDs and device geolocation for hyper-local microclimate calculations. Zero advertising cookies or data broker sharing. Calibrated against ISO 7243:2017 & OSHA guidelines.
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => openLegalModalWithTab('privacy')}
              className="text-white/60 hover:text-white underline text-[11px] py-1.5 px-2 transition-colors"
            >
              Privacy & Policies
            </button>
            <button
              onClick={() => openLegalModalWithTab('data-deletion')}
              className="text-red-400 hover:text-red-300 underline text-[11px] py-1.5 px-2 transition-colors"
            >
              Purge Cache
            </button>
            <button
              onClick={handleAccept}
              className="bg-[#244CFF] hover:bg-[#3860FF] text-white font-bold uppercase tracking-wider text-[11px] px-5 py-2 transition-colors border border-[#244CFF]"
            >
              Acknowledge & Proceed
            </button>
          </div>
        </div>
      </aside>

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultTab={legalModalTab}
      />
    </>
  );
};
