'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Worker } from '@/types/api';

interface WorkerRosterProps {
  privacyMode: boolean;
}

export const WorkerRoster: React.FC<WorkerRosterProps> = ({ privacyMode }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [badgeId, setBadgeId] = useState<string>('W-204');
  const [fullName, setFullName] = useState<string>('Marcus Vance');
  const [age, setAge] = useState<number>(34);
  const [sex, setSex] = useState<string>('M');
  const [mass, setMass] = useState<number>(82.0);
  const [height, setHeight] = useState<number>(182.0);
  const [acclimation, setAcclimation] = useState<number>(1);

  const fetchWorkers = async () => {
    try {
      const data = await api.listWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Failed to list workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorker({
        external_id: badgeId,
        full_name: fullName,
        age_yrs: age,
        sex: sex,
        body_mass_kg: mass,
        height_cm: height,
        acclimation_status: acclimation,
      });
      setBadgeId(`W-${Math.floor(100 + Math.random() * 900)}`);
      fetchWorkers();
    } catch (err) {
      console.error('Failed to create worker:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-neutral-400">
            Occupational Registry
          </span>
          <h2 className="text-xl font-bold text-[var(--porcelain)]">
            Worker Profiles & Acclimation Roster
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Tracks individual physiological baselines, heat acclimation states, and active shift
            assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Registration Form (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)]">
          <h3 className="text-sm font-semibold text-[var(--porcelain)] border-b border-[var(--carbon-border)] pb-2 mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[var(--ultramarine)]" />
            <span>Register New Worker</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1">BADGE ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)] font-bold"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">AGE (Yrs)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">SEX</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">MASS (kg)</label>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(Number(e.target.value))}
                  className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">HEIGHT (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">ACCLIMATION STATUS</label>
              <select
                value={acclimation}
                onChange={(e) => setAcclimation(Number(e.target.value))}
                className="w-full bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] rounded-lg p-2 text-[var(--porcelain)]"
              >
                <option value={0}>0 — Unacclimated</option>
                <option value={1}>1 — Short-Term Acclimated</option>
                <option value={2}>2 — Long-Term / Highly Acclimated</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-[var(--ultramarine)] hover:bg-[var(--ultramarine-hover)] text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              Add to Active Roster
            </button>
          </form>
        </div>

        {/* Right: Roster Table (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--porcelain)] border-b border-[var(--carbon-border)] pb-2 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--ultramarine)]" />
              <span>Registered Industrial Personnel ({workers.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--carbon-border)] text-neutral-400">
                    <th className="pb-2">BADGE</th>
                    <th className="pb-2">WORKER</th>
                    <th className="pb-2">DEMOGRAPHICS</th>
                    <th className="pb-2">ACCLIMATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--carbon-border)]">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-[var(--carbon-elevated)]">
                      <td className="py-2.5 text-[var(--vanilla-cream)] font-bold">
                        {w.external_id}
                      </td>
                      <td className="py-2.5 text-[var(--porcelain)]">
                        {privacyMode ? `Worker #${w.external_id}` : w.full_name}
                      </td>
                      <td className="py-2.5 text-neutral-400">
                        {w.age_yrs}y • {w.sex} • {w.body_mass_kg}kg • {w.height_cm}cm
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-[var(--carbon-elevated)] border border-[var(--carbon-border)] text-[var(--neon-jade)]">
                          Tier {w.acclimation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-500">
                        No registered workers found. Add one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-400 pt-3 border-t border-[var(--carbon-border)]">
            Worker records are stored with full parameterization and protected by Row-Level Security.
          </div>
        </div>
      </div>
    </div>
  );
};
