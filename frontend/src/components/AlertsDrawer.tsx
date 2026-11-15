'use client';

import React, { useState } from 'react';
import { X, Check, ShieldAlert, AlertTriangle, Siren } from 'lucide-react';
import { SafetyAlert } from '@/types/api';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SafetyAlert[];
  onAcknowledge: (id: string) => void;
  onClearAll?: () => void;
}

const getSeverityConfig = (severity: string) => {
  const s = severity.toUpperCase();
  if (s.includes('EMERGENCY') || s.includes('CRITICAL')) {
    return {
      bg: 'bg-red-900/40',
      border: 'border-red-500/70',
      badge: 'bg-red-600',
      icon: <Siren className="h-4 w-4 text-red-400" />,
      label: 'CRITICAL',
    };
  }
  if (s.includes('WARNING') || s.includes('HIGH')) {
    return {
      bg: 'bg-amber-900/20',
      border: 'border-amber-500/50',
      badge: 'bg-amber-600',
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
      label: 'WARNING',
    };
  }
  return {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/40',
    badge: 'bg-blue-600',
    icon: <ShieldAlert className="h-4 w-4 text-blue-400" />,
    label: 'INFO',
  };
};

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onClearAll,
}) => {
  const [clearing, setClearing] = useState(false);
  const [ackingId, setAckingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAcknowledge = async (id: string) => {
    setAckingId(id);
    try {
      await onAcknowledge(id);
    } finally {
      setAckingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!onClearAll) return;
    setClearing(true);
    try {
      await onClearAll();
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-[#0D0F12] border-l border-white/10 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-[#E72D49]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Safety Incidents
            </h2>
            {alerts.length > 0 && (
              <span className="bg-[#E72D49] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && onClearAll && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="text-[11px] font-mono px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const isAcking = ackingId === alert.id;

            return (
              <div
                key={alert.id}
                className={`p-4 border ${config.border} ${config.bg} space-y-3 transition-opacity ${
                  isAcking ? 'opacity-50' : ''
                }`}
              >
                {/* Severity + Timestamp Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 ${config.badge} text-white font-bold uppercase`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-white leading-tight">
                  {alert.title}
                </h4>

                {/* Message */}
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {alert.message}
                </p>

                {/* Acknowledge Button */}
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={isAcking}
                  className="w-full mt-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono py-2 flex items-center justify-center gap-2 text-white transition-all disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{isAcking ? 'Acknowledging...' : 'Acknowledge & Clear'}</span>
                </button>
              </div>
            );
          })}

          {/* Empty State */}
          {alerts.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-sm font-mono text-neutral-300">All clear.</p>
              <p className="text-xs font-mono text-neutral-500">
                No active safety incidents. All workers in safe thermal zones.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 text-[11px] font-mono text-neutral-500">
          Incident logging active • OSHA / NIOSH compliant
        </div>
      </div>
    </div>
  );
};
