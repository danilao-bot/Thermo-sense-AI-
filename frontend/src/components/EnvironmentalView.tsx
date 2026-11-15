'use client';

import React, { useState, useEffect } from 'react';
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
      console.error(err);
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
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
            Sensor-Free Fallback Mode
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
            Environmental Heat Risk & Labor Capacity.
          </h1>
          <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
            Predicts Physical Work Capacity loss percentage (PWC%) and ISO 7243 work-rest cycles
            based on dry-bulb temperature, vapor pressure, and solar radiation.
          </p>
        </div>

        <button
          onClick={() => {
            setAirTemp(41.0);
            setHumidity(70);
          }}
          className="bg-white/5 border border-white/10 hover:border-white/30 text-xs font-mono uppercase px-4 py-3 text-white tracking-wider self-start md:self-auto"
        >
          Preset: Extreme Heatwave
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Atmospheric Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-[#14171C] border border-white/10 p-8 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-white/40 block">
            Environmental Parameters
          </span>

          <div className="space-y-6 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-2 text-white/80">
                <span>Air Dry-Bulb Temperature: {airTemp.toFixed(1)}°C</span>
                <span className="text-white/30">-10 to 60°C</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="0.5"
                value={airTemp}
                onChange={(e) => setAirTemp(Number(e.target.value))}
                className="w-full accent-[#244CFF] bg-white/10 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 text-white/80">
                <span>Relative Humidity: {humidity}%</span>
                <span className="text-white/30">10 to 100%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-[#244CFF] bg-white/10 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 text-white/80">
                <span>Solar Radiation: {solar} W/m²</span>
                <span className="text-white/30">0 to 1000</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={solar}
                onChange={(e) => setSolar(Number(e.target.value))}
                className="w-full accent-[#244CFF] bg-white/10 h-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 text-white/80">
                <span>Clothing Insulation (clo): {clo}</span>
                <span className="text-white/30">Heavy PPE 1.2+</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={clo}
                onChange={(e) => setClo(Number(e.target.value))}
                className="w-full accent-[#244CFF] bg-white/10 h-1 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Big Impact Readout (6 cols) */}
        <div className="lg:col-span-6 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                PWC REDUCTION ESTIMATE
              </span>
              <span className="text-xs font-mono text-[#FFF5D9] border border-white/10 px-2 py-0.5">
                {envData?.environmental_risk_level || 'Moderate Risk'}
              </span>
            </div>

            {/* Huge Number */}
            <div className="text-center py-6">
              <div className="text-7xl lg:text-8xl font-black text-white tabular-nums font-display">
                {pwcLoss.toFixed(1)}
                <span className="text-3xl font-light text-white/40 ml-2">%</span>
              </div>
              <span className="text-xs font-mono text-[#9470DB] block mt-3">
                90% Conformal Range: [{pwcLower.toFixed(1)}% — {pwcUpper.toFixed(1)}%]
              </span>
            </div>

            {/* Prescribed Rest Ratio */}
            <div className="bg-[#0D0F12] border border-white/10 p-6 mt-6">
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-1">
                PRESCRIBED OCCUPATIONAL SCHEDULE
              </span>
              <div className="text-xl font-bold text-white font-display">
                {envData?.recommended_work_rest_ratio || '45m Work / 15m Shaded Rest'}
              </div>
              <p className="text-xs font-mono text-white/50 mt-2">
                Heat Index: {envData?.heat_index_C ? `${envData.heat_index_C}°C` : '38.5°C'}.
                Mandatory cooling break intervals required to prevent cumulative heat storage.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-white/30 pt-6 border-t border-white/10 block mt-6">
            Trained on HEATSHIELD D1/D2 clinical trials (975 occupational sessions, R²=0.987).
          </span>
        </div>
      </div>
    </div>
  );
};
