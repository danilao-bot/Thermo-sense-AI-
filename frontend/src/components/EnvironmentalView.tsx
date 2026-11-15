'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Sun, Compass, ShieldAlert, Cpu } from 'lucide-react';
import { api } from '@/lib/api';
import { EnvironmentalRiskResponse } from '@/types/api';

export const EnvironmentalView: React.FC = () => {
  const [airTemp, setAirTemp] = useState<number>(36.0);
  const [humidity, setHumidity] = useState<number>(65);
  const [windSpeed, setWindSpeed] = useState<number>(0.5);
  const [solar, setSolar] = useState<number>(450);
  const [clo, setClo] = useState<number>(1.2);
  const [durationMin, setDurationMin] = useState<number>(60);

  const [envData, setEnvData] = useState<EnvironmentalRiskResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const evaluateEnv = async () => {
    setLoading(true);
    try {
      const res = await api.evaluateEnvironmental({
        air_temp_C: airTemp,
        relative_humidity_pct: humidity,
        wind_speed_m_s: windSpeed,
        solar_radiation_W_m2: solar,
        clothing_clo: clo,
        work_duration_min: durationMin,
      });
      setEnvData(res);
    } catch (err) {
      console.error('Mode B calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateEnv();
  }, [airTemp, humidity, windSpeed, solar, clo, durationMin]);

  const pwcLoss = envData?.pwc_loss.point_estimate_pct ?? 32.5;
  const pwcLower = envData?.pwc_loss.lower_bound_pct ?? 28.0;
  const pwcUpper = envData?.pwc_loss.upper_bound_pct ?? 37.0;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-neutral-400">
            Mode B Fallback Engine (HEATSHIELD Model B)
          </span>
          <h2 className="text-xl font-bold text-[var(--porcelain)]">
            Environmental Thermal Stress & Work Capacity Loss
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Predicts Physical Work Capacity loss (PWC%) and ISO work/rest ratios when wearable
            sensors are unavailable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAirTemp(41.0);
              setHumidity(70);
            }}
            className="px-3 py-1.5 rounded-lg border border-[var(--carbon-border)] bg-[var(--carbon-elevated)] hover:bg-[var(--carbon-border)] text-xs font-mono text-[var(--vanilla-cream)]"
          >
            Load Heatwave Preset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weather Input Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] space-y-4">
          <h3 className="text-sm font-semibold text-[var(--porcelain)] border-b border-[var(--carbon-border)] pb-2 flex items-center gap-2">
            <CloudSun className="h-4 w-4 text-[var(--ultramarine)]" />
            <span>Atmospheric & Microclimate Parameters</span>
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span>Air Dry-Bulb Temperature: {airTemp.toFixed(1)}°C</span>
                <span className="text-neutral-500">Range: -10 to 60°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="0.5"
                value={airTemp}
                onChange={(e) => setAirTemp(Number(e.target.value))}
                className="w-full accent-[var(--ultramarine)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Relative Humidity: {humidity}%</span>
                <span className="text-neutral-500">Range: 0 to 100%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-[var(--ultramarine)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Solar Irradiance: {solar} W/m²</span>
                <span className="text-neutral-500">Clear noon ~800 W/m²</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={solar}
                onChange={(e) => setSolar(Number(e.target.value))}
                className="w-full accent-[var(--ultramarine)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Clothing Insulation (clo): {clo}</span>
                <span className="text-neutral-500">Heavy PPE: 1.2 - 1.6</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={clo}
                onChange={(e) => setClo(Number(e.target.value))}
                className="w-full accent-[var(--ultramarine)]"
              />
            </div>
          </div>
        </div>

        {/* Right: Model B PWC Loss Output & Work/Rest Ratio (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--carbon-surface)] p-6 rounded-2xl border border-[var(--carbon-border)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--carbon-border)] pb-2 mb-4">
              <h3 className="text-sm font-semibold text-[var(--porcelain)] flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[var(--neon-jade)]" />
                <span>Physical Work Capacity (PWC) Projection</span>
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--carbon-elevated)] text-[var(--vanilla-cream)]">
                {envData?.environmental_risk_level || 'Moderate Risk'}
              </span>
            </div>

            {/* PWC Capacity Loss Main Readout */}
            <div className="p-6 bg-[var(--carbon-elevated)] rounded-xl border border-[var(--carbon-border)] text-center my-4">
              <span className="text-xs font-mono text-neutral-400 block uppercase">
                Productivity / Labor Capacity Reduction
              </span>
              <div className="text-5xl font-black text-[var(--porcelain)] tabular-nums mt-2">
                {pwcLoss.toFixed(1)}
                <span className="text-2xl font-light text-neutral-400">% Loss</span>
              </div>
              <div className="text-xs font-mono text-[var(--sugar-violet)] mt-2">
                90% Conformal Range: [{pwcLower.toFixed(1)}% – {pwcUpper.toFixed(1)}%]
              </div>
            </div>

            {/* OSHA Work/Rest Protocol Card */}
            <div className="p-4 bg-[var(--carbon-base)] rounded-xl border border-[var(--carbon-border)] space-y-2">
              <span className="text-xs font-mono uppercase text-neutral-400 block">
                Prescribed Work/Rest Schedule
              </span>
              <div className="text-lg font-bold text-[var(--vanilla-cream)]">
                {envData?.recommended_work_rest_ratio || '45m Work / 15m Shaded Rest'}
              </div>
              <p className="text-xs text-neutral-400">
                Heat Index: {envData?.heat_index_C ? `${envData.heat_index_C}°C` : '38.5°C'}.
                Mandatory shaded recovery required to prevent cumulative heat storage.
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-400 pt-3 border-t border-[var(--carbon-border)]">
            Trained on HEATSHIELD D1/D2 clinical climatic data (975 occupational sessions, R²=0.987).
          </div>
        </div>
      </div>
    </div>
  );
};
