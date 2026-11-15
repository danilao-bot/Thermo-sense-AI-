'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Worker } from '@/types/api';

interface WorkerRosterProps {
  privacyMode: boolean;
}

export const WorkerRoster: React.FC<WorkerRosterProps> = ({ privacyMode }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
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
      console.error(err);
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
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
          Occupational Personnel
        </span>
        <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
          Industrial Worker Roster.
        </h1>
        <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
          Registered worker profiles, baseline biometric mass, and thermal acclimation ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form (4 cols) */}
        <div className="lg:col-span-4 bg-[#14171C] border border-white/10 p-8 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40 block">
            Add Worker
          </span>

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-white/50 mb-1">BADGE ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
              />
            </div>

            <div>
              <label className="block text-white/50 mb-1">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 mb-1">AGE</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
                />
              </div>
              <div>
                <label className="block text-white/50 mb-1">SEX</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 mb-1">MASS (KG)</label>
                <input
                  type="number"
                  value={mass}
                  onChange={(e) => setMass(Number(e.target.value))}
                  className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
                />
              </div>
              <div>
                <label className="block text-white/50 mb-1">HEIGHT (CM)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 mb-1">ACCLIMATION LEVEL</label>
              <select
                value={acclimation}
                onChange={(e) => setAcclimation(Number(e.target.value))}
                className="w-full bg-[#0D0F12] border border-white/10 p-3 text-white focus:border-[#244CFF] outline-none"
              >
                <option value={0}>Tier 0 — Unacclimated</option>
                <option value={1}>Tier 1 — Moderate Acclimation</option>
                <option value={2}>Tier 2 — High Acclimation</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#244CFF] hover:bg-[#1b3ad8] text-white font-mono text-xs uppercase font-bold tracking-wider py-4 mt-2 transition-all"
            >
              Register Badge
            </button>
          </form>
        </div>

        {/* Table (8 cols) */}
        <div className="lg:col-span-8 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-6">
              Active Registry ({workers.length} Personnel)
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="pb-3">BADGE</th>
                    <th className="pb-3">WORKER NAME</th>
                    <th className="pb-3">METRICS</th>
                    <th className="pb-3">ACCLIMATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5">
                      <td className="py-3 text-white font-bold">{w.external_id}</td>
                      <td className="py-3 text-white/90">
                        {privacyMode ? `Worker #${w.external_id}` : w.full_name}
                      </td>
                      <td className="py-3 text-white/40">
                        {w.age_yrs}y • {w.sex} • {w.body_mass_kg}kg • {w.height_cm}cm
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] uppercase font-bold text-[#10B981]">
                          Tier {w.acclimation_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-white/30">
                        No workers registered. Add one on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
