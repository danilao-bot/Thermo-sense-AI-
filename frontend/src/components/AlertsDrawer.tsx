'use client';

import React from 'react';
import { X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { SafetyAlert } from '@/types/api';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SafetyAlert[];
  onAcknowledge: (id: string) => void;
  onClearAll?: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--carbon-surface)] border-l border-[var(--carbon-border)] h-full p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[var(--cherry-red)]" />
              <h2 className="text-base font-bold text-[var(--porcelain)]">
                Active Safety Incidents ({alerts.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {alerts.length > 0 && onClearAll && (
                <button
                  onClick={onClearAll}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--carbon-elevated)] text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-[var(--cherry-red)]/50 bg-[var(--cherry-red)]/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--cherry-red)] text-white font-bold">
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[var(--porcelain)]">{alert.title}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">{alert.message}</p>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="w-full mt-2 bg-[var(--carbon-elevated)] hover:bg-[var(--carbon-border)] border border-[var(--carbon-border)] text-xs font-mono py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[var(--porcelain)] hover:text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5 text-[var(--neon-jade)]" />
                  <span>Acknowledge & Clear</span>
                </button>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="py-12 text-center text-xs font-mono text-neutral-400 space-y-2">
                <Check className="h-8 w-8 text-[var(--neon-jade)] mx-auto opacity-70" />
                <p>No unacknowledged safety incidents active.</p>
                <p className="text-[10px] text-neutral-500">All workers in safe thermal zones.</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--carbon-border)] text-[11px] font-mono text-neutral-400">
          OSHA / NIOSH compliance incident logging enabled.
        </div>
      </div>
    </div>
  );
};
