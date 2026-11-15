'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { EnvironmentalRiskResponse, WeatherResponse } from '@/types/api';
import { CloudSun, MapPin, RefreshCw, AlertCircle, Wind, Droplets, Sun, Shirt } from 'lucide-react';

export const EnvironmentalView: React.FC = () => {
  // Weather state from Open-Meteo
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locName, setLocName] = useState<string>('Detecting location...');
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Environmental inputs (synced from Open-Meteo)
  const [airTemp, setAirTemp] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number>(0.5);
  const [solar, setSolar] = useState<number>(0);
  const [clo, setClo] = useState<number>(1.2);
  const [durationMin, setDurationMin] = useState<number>(60);

  // Analysis result
  const [envData, setEnvData] = useState<EnvironmentalRiskResponse | null>(null);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);

  // Fetch live weather from backend (Open-Meteo)
  const fetchLiveWeather = useCallback(async (latitude: number, longitude: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await api.getWeather(latitude, longitude);
      setWeatherData(data);
      setAirTemp(data.air_temp_C);
      setHumidity(data.relative_humidity_pct);
      setWindSpeed(data.wind_speed_m_s);
      setSolar(data.solar_radiation_W_m2);
      setCoords({ lat: latitude, lon: longitude });
      setLocName(`GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sync Open-Meteo weather';
      setWeatherError(msg);
      // Fallback sensible defaults if network is offline
      setAirTemp(28.0);
      setHumidity(50);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Request browser GPS position
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setWeatherError('Geolocation not supported by browser. Falling back to default site coordinates.');
      fetchLiveWeather(40.7128, -74.006); // Default site
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchLiveWeather(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setLocName('Default Industrial Site (Lat: 40.71, Lon: -74.01)');
        fetchLiveWeather(40.7128, -74.006);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchLiveWeather]);

  // Initial load: sync GPS weather
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Evaluate whenever weather inputs or PPE clo change
  useEffect(() => {
    if (airTemp === null || humidity === null) return;

    let isMounted = true;
    const runEval = async () => {
      setEvalLoading(true);
      try {
        const res = await api.evaluateEnvironmental({
          air_temp_C: airTemp,
          relative_humidity_pct: humidity,
          wind_speed_m_s: windSpeed,
          solar_radiation_W_m2: solar,
          clothing_clo: clo,
          work_duration_min: durationMin,
        });
        if (isMounted) setEnvData(res);
      } catch (err) {
        console.error('Failed to evaluate environmental load:', err);
      } finally {
        if (isMounted) setEvalLoading(false);
      }
    };

    runEval();
    return () => {
      isMounted = false;
    };
  }, [airTemp, humidity, windSpeed, solar, clo, durationMin]);

  const pwcLoss = envData?.pwc_loss.point_estimate_pct ?? null;
  const pwcLower = envData?.pwc_loss.lower_bound_pct ?? null;
  const pwcUpper = envData?.pwc_loss.upper_bound_pct ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#244CFF]">
            Workplace Environment • Live Open-Meteo
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-display mt-2">
            Environmental Heat Risk.
          </h1>
          <p className="text-sm font-mono text-white/50 max-w-2xl mt-2">
            Live meteorological data from Open-Meteo synced with worker location to evaluate thermal work capacity loss.
          </p>
        </div>

        <button
          onClick={requestLocation}
          disabled={weatherLoading}
          className="bg-white/5 border border-white/10 hover:border-white/30 text-xs font-mono uppercase px-4 py-3 text-white tracking-wider flex items-center gap-2 transition-all self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${weatherLoading ? 'animate-spin text-[#244CFF]' : ''}`} />
          <span>{weatherLoading ? 'Syncing Weather...' : 'Refresh Live Weather'}</span>
        </button>
      </div>

      {/* Live Location & Open-Meteo Status Bar */}
      <div className="bg-[#14171C] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-[#244CFF] shrink-0" />
          <span className="text-white/80">{locName}</span>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded">
            {weatherData?.source || 'Open-Meteo API'}
          </span>
        </div>
        {coords && (
          <div className="text-white/40 text-[11px]">
            Coords: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • WBGT Est:{' '}
            <span className="text-[#FFF5D9] font-bold">{weatherData?.wbgt_estimated_C ?? '--'}°C</span>
          </div>
        )}
      </div>

      {weatherError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded text-xs font-mono flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{weatherError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Real Live Ambient Meteorological Data (6 cols) */}
        <div className="lg:col-span-6 bg-[#14171C] border border-white/10 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40">
              Live Ambient Meteorological Telemetry
            </span>
            <span className="text-[11px] font-mono text-[#244CFF]">
              {weatherLoading ? 'Syncing...' : 'Real-time Feeds'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Air Temp */}
            <div className="bg-[#0D0F12] border border-white/5 p-4 rounded">
              <div className="flex items-center justify-between text-white/40 text-xs font-mono">
                <span>Air Temperature</span>
                <CloudSun className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white font-display mt-2">
                {airTemp !== null ? airTemp.toFixed(1) : '--'}
                <span className="text-sm font-light text-white/40 ml-1">°C</span>
              </div>
              <span className="text-[10px] font-mono text-white/40 mt-1 block">
                Open-Meteo 2m Sensor
              </span>
            </div>

            {/* Relative Humidity */}
            <div className="bg-[#0D0F12] border border-white/5 p-4 rounded">
              <div className="flex items-center justify-between text-white/40 text-xs font-mono">
                <span>Relative Humidity</span>
                <Droplets className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white font-display mt-2">
                {humidity !== null ? Math.round(humidity) : '--'}
                <span className="text-sm font-light text-white/40 ml-1">%</span>
              </div>
              <span className="text-[10px] font-mono text-white/40 mt-1 block">
                Vapor Pressure: {weatherData?.vapor_pressure_hpa ?? '--'} hPa
              </span>
            </div>

            {/* Wind Speed */}
            <div className="bg-[#0D0F12] border border-white/5 p-4 rounded">
              <div className="flex items-center justify-between text-white/40 text-xs font-mono">
                <span>Wind Speed</span>
                <Wind className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white font-display mt-2">
                {windSpeed.toFixed(1)}
                <span className="text-sm font-light text-white/40 ml-1">m/s</span>
              </div>
              <span className="text-[10px] font-mono text-white/40 mt-1 block">
                Anemometer 10m height
              </span>
            </div>

            {/* Solar Radiation */}
            <div className="bg-[#0D0F12] border border-white/5 p-4 rounded">
              <div className="flex items-center justify-between text-white/40 text-xs font-mono">
                <span>Direct Solar</span>
                <Sun className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-3xl font-black text-white font-display mt-2">
                {Math.round(solar)}
                <span className="text-sm font-light text-white/40 ml-1">W/m²</span>
              </div>
              <span className="text-[10px] font-mono text-white/40 mt-1 block">
                Solar irradiance load
              </span>
            </div>
          </div>

          {/* Operational Clothing Insulation Setting */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/60 flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5 text-neutral-400" />
                <span>Clothing Insulation (clo): {clo}</span>
              </span>
              <span className="text-white/30">{clo >= 1.2 ? 'Heavy Workwear / PPE' : 'Light Standard'}</span>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Light (0.6)', val: 0.6 },
                { label: 'Workwear (1.0)', val: 1.0 },
                { label: 'Heavy PPE (1.5)', val: 1.5 },
                { label: 'Hazmat (2.0)', val: 2.0 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setClo(item.val)}
                  className={`flex-1 py-1.5 text-[11px] font-mono uppercase border transition-all ${
                    clo === item.val
                      ? 'border-[#244CFF] bg-[#244CFF]/20 text-white font-bold'
                      : 'border-white/10 hover:border-white/30 text-white/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Work Capacity Loss & Work/Rest Ratio (6 cols) */}
        <div className="lg:col-span-6 bg-[#14171C] border border-white/10 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">
                ESTIMATED PHYSICAL WORK CAPACITY LOSS
              </span>
              <span className="text-xs font-mono text-[#FFF5D9] border border-white/10 px-2 py-0.5">
                {envData?.environmental_risk_level || 'Evaluating...'}
              </span>
            </div>

            {/* Readout */}
            <div className="text-center py-6">
              {pwcLoss !== null ? (
                <>
                  <div className="text-7xl lg:text-8xl font-black text-white tabular-nums font-display">
                    {pwcLoss.toFixed(1)}
                    <span className="text-3xl font-light text-white/40 ml-2">%</span>
                  </div>
                  {pwcLower !== null && pwcUpper !== null && (
                    <span className="text-xs font-mono text-[#9470DB] block mt-3">
                      Uncertainty Range: [{pwcLower.toFixed(1)}% — {pwcUpper.toFixed(1)}%]
                    </span>
                  )}
                </>
              ) : (
                <div className="text-4xl font-mono text-white/30 py-8">
                  {evalLoading ? 'Calculating...' : 'Awaiting Weather'}
                </div>
              )}
            </div>

            {/* Prescribed Rest Ratio */}
            <div className="bg-[#0D0F12] border border-white/10 p-6 mt-6">
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-1">
                RECOMMENDED WORK/REST RATIO
              </span>
              <div className="text-xl font-bold text-white font-display">
                {envData?.recommended_work_rest_ratio || '45m Work / 15m Shaded Rest'}
              </div>
              <p className="text-xs font-mono text-white/50 mt-2">
                Heat Index: {envData?.heat_index_C ? `${envData.heat_index_C}°C` : '--'}.
                Scheduled recovery breaks required according to ISO 7243 & OSHA guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
