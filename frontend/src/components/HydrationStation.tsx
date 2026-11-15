'use client';

import React, { useState } from 'react';
import { Droplets, Scale, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { HydrationResponse } from '@/types/api';

export const HydrationStation: React.FC = () => {
  const [preMass, setPreMass] = useState<number>(78.5);
  const [postMass, setPostMass] = useState<number>(76.9);
  const [durationMin, setDurationMin] = useState<number>(90);
  const [hydrationResult, setHydrationResult] = useState<HydrationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.calculateHydration({
        pre_mass_kg: preMass,
        post_mass_kg: postMass,
        work_duration_min: durationMin,
      });
      setHydrationResult(res);
    } catch (err) {
      console.error('Hydration calc error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)]">
        <span className="text-xs font-mono uppercase text-neutral-400">
          Model C Mass Balance Engine
        </span>
        <h2 className="text-xl font-bold text-[var(--porcelain)]">
          Pre/Post Shift Weigh-In & Fluid Balance Station
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Measures acute dehydration through acute body mass delta (Delta mass) and calculates
          150% fluid replacement volume to restore circulating plasma volume.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] space-y-4">
          <h3 className="text-sm font-semibold text-[var(--porcelain)] border-b border-[var(--carbon-border)] pb-2 flex items-center gap-2">
            <Scale className="h-4 w-4 text-[var(--ultramarine)]" />
            <span>Worker Weigh-In Entry</span>
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1">PRE-SHIFT MASS (kg)</label>
              <input
                type="number"
                step="0.1"
                value={preMass}
                onChange={(e) => setPreMass(Number(e.target.value))}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2.5 text-[var(--porcelain)] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">POST-SHIFT MASS (kg)</label>
              <input
                type="number"
                step="0.1"
                value={postMass}
                onChange={(e) => setPostMass(Number(e.target.value))}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2.5 text-[var(--porcelain)] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">EXPOSURE DURATION (Minutes)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2.5 text-[var(--porcelain)] font-bold text-sm"
              />
            </div>

            <button
              onClick={calculate}
              disabled={loading}
              className="w-full mt-4 bg-[var(--ultramarine)] hover:bg-[var(--ultramarine-hover)] text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span>{loading ? 'Evaluating Balance...' : 'Calculate Rehydration Target'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Output Diagnostics (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--porcelain)] border-b border-[var(--carbon-border)] pb-2 mb-4 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-[var(--ultramarine)]" />
              <span>Fluid Deficit & Replacement Protocol</span>
            </h3>

            {hydrationResult ? (
              <div className="space-y-4">
                {/* Metric Summary Card */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-[var(--carbon-elevated)] rounded-xl border border-[var(--carbon-border)]">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Body Mass Loss %
                    </span>
                    <div className="text-2xl font-bold tabular-nums text-[var(--porcelain)] mt-1">
                      {hydrationResult.body_mass_loss_pct.toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--carbon-elevated)] rounded-xl border border-[var(--carbon-border)]">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      Fluid Deficit (Sweat Lost)
                    </span>
                    <div className="text-2xl font-bold tabular-nums text-[var(--ultramarine)] mt-1">
                      {hydrationResult.fluid_loss_liters.toFixed(2)} L
                    </div>
                  </div>
                </div>

                {/* Status Alert Pill */}
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-mono ${
                    hydrationResult.body_mass_loss_pct > 2.0
                      ? 'border-[var(--cherry-red)] bg-[var(--cherry-red)]/10 text-white'
                      : 'border-[var(--neon-jade)] bg-[var(--neon-jade)]/10 text-[var(--neon-jade)]'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Status: {hydrationResult.hydration_status}</span>
                </div>

                {/* Rehydration Directive */}
                <div className="p-4 bg-[var(--carbon-base)] rounded-xl border border-[var(--carbon-border)] space-y-1">
                  <span className="text-xs font-mono uppercase text-neutral-400">
                    Target Electrolyte Replacement
                  </span>
                  <div className="text-base font-bold text-[var(--vanilla-cream)]">
                    {(hydrationResult.fluid_loss_liters * 1.5).toFixed(2)} Liters Required
                  </div>
                  <p className="text-xs text-neutral-400">
                    {hydrationResult.recommended_hydration}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-400 text-xs">
                <Scale className="h-8 w-8 mb-2 opacity-50 text-[var(--ultramarine)]" />
                <span>Enter pre/post shift weigh-in values to calculate fluid deficit.</span>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-neutral-400 pt-3 border-t border-[var(--carbon-border)]">
            Prescribes ISO 15265 / Moran hydration deficit math with sodium replenishment buffer.
          </div>
        </div>
      </div>
    </div>
  );
};
