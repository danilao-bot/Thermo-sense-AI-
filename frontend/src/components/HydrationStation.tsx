'use client';

import React, { useState } from 'react';
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
          Model C Mass Balance Engine
        </span>
        <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
          Hydration & Sweat Loss Station.
        </h1>
        <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
          Calculates acute dehydration via acute body mass delta and prescribes 150% fluid
          volume with sodium buffer to restore intravascular plasma volume.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#14171C] border border-white/10 p-8 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40 block">
            Weigh-In Input
          </span>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-white/50 mb-2 uppercase">PRE-EXPOSURE MASS (KG)</label>
              <input
                type="number"
                step="0.1"
                value={preMass}
                onChange={(e) => setPreMass(Number(e.target.value))}
                className="w-full bg-[#0D0F12] border border-white/10 p-4 text-white font-mono text-lg font-bold focus:border-[#244CFF] outline-none"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-2 uppercase">POST-EXPOSURE MASS (KG)</label>
              <input
                type="number"
                step="0.1"
                value={postMass}
                onChange={(e) => setPostMass(Number(e.target.value))}
                className="w-full bg-[#0D0F12] border border-white/10 p-4 text-white font-mono text-lg font-bold focus:border-[#244CFF] outline-none"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-2 uppercase">EXPOSURE TIME (MINUTES)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-[#0D0F12] border border-white/10 p-4 text-white font-mono text-lg font-bold focus:border-[#244CFF] outline-none"
              />
            </div>

            <button
              onClick={calculate}
              disabled={loading}
              className="w-full bg-[#244CFF] hover:bg-[#1b3ad8] text-white font-mono text-xs uppercase font-bold tracking-wider py-4 mt-4 transition-all"
            >
              {loading ? 'Evaluating...' : 'Compute Fluid Replacement Target'}
            </button>
          </div>
        </div>

        {/* Output Diagnostic (7 cols) */}
        <div className="lg:col-span-7 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                Fluid Deficit Diagnostics
              </span>
              {hydrationResult && (
                <span
                  className={`text-xs font-mono uppercase px-3 py-1 font-bold ${
                    hydrationResult.body_mass_loss_pct > 2.0
                      ? 'bg-[#E72D49] text-white'
                      : 'bg-[#10B981] text-white'
                  }`}
                >
                  {hydrationResult.hydration_status}
                </span>
              )}
            </div>

            {hydrationResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0D0F12] border border-white/10 p-6 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                      BODY MASS LOSS
                    </span>
                    <div className="text-4xl font-black text-white font-display tabular-nums mt-2">
                      {hydrationResult.body_mass_loss_pct.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-[#0D0F12] border border-white/10 p-6 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                      SWEAT VOLUME LOST
                    </span>
                    <div className="text-4xl font-black text-[#244CFF] font-display tabular-nums mt-2">
                      {hydrationResult.fluid_loss_liters.toFixed(2)} L
                    </div>
                  </div>
                </div>

                <div className="bg-[#0D0F12] border border-white/10 p-6 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                    150% REHYDRATION TARGET
                  </span>
                  <div className="text-2xl font-black text-white font-display">
                    {(hydrationResult.fluid_loss_liters * 1.5).toFixed(2)} Liters Required
                  </div>
                  <p className="text-xs font-mono text-white/60 leading-relaxed mt-2">
                    {hydrationResult.recommended_hydration}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center font-mono text-xs text-white/30 uppercase tracking-widest">
                Awaiting Weigh-In Computation
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono text-white/30 pt-6 border-t border-white/10 block mt-6">
            Follows Moran / Sawka mass conservation protocols.
          </span>
        </div>
      </div>
    </div>
  );
};
