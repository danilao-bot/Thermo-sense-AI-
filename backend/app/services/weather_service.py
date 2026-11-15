"""Open-Meteo Weather Connector for ThermoSense AI.

Fetches live ambient meteorological conditions (air temp, relative humidity,
wind speed, direct solar irradiance) without requiring API keys.
"""

import time
from typing import Dict, Any, Optional
import httpx

class OpenMeteoWeatherService:
    """Free Open-Meteo connector with in-memory caching."""

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, cache_ttl_seconds: int = 600):
        self.cache_ttl = cache_ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    async def get_current_weather(
        self,
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """Retrieves ambient weather for given GPS coordinates."""
        cache_key = f"{round(latitude, 3)},{round(longitude, 3)}"
        now = time.time()

        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["cached_at"] < self.cache_ttl:
                return entry["data"]

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,direct_normal_irradiance",
            "timezone": "auto",
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(self.BASE_URL, params=params)
                resp.raise_for_status()
                data = resp.json()

            current = data.get("current", {})
            t_air = float(current.get("temperature_2m", 25.0))
            rh = float(current.get("relative_humidity_2m", 50.0))
            wind = float(current.get("wind_speed_10m", 0.5))
            solar = float(current.get("direct_normal_irradiance", 0.0))

            # Compute Buck vapor pressure
            vp = (rh / 100.0) * 6.1121 * (2.71828 ** ((18.678 - (t_air / 234.5)) * (t_air / (257.14 + t_air))))
            # Australian BoM estimated WBGT
            wbgt_est = 0.567 * t_air + 0.393 * vp + 3.94 + 0.005 * solar

            result = {
                "latitude": latitude,
                "longitude": longitude,
                "air_temp_C": t_air,
                "relative_humidity_pct": rh,
                "wind_speed_m_s": wind,
                "solar_radiation_W_m2": solar,
                "vapor_pressure_hpa": round(vp, 2),
                "wbgt_estimated_C": round(wbgt_est, 1),
                "source": "Open-Meteo API (Free tier)",
                "live_status": "synced",
            }

            self._cache[cache_key] = {"cached_at": now, "data": result}
            return result

        except Exception as e:
            # Fallback to standard occupational baseline if network is unreachable
            return {
                "latitude": latitude,
                "longitude": longitude,
                "air_temp_C": 28.0,
                "relative_humidity_pct": 50.0,
                "wind_speed_m_s": 0.5,
                "solar_radiation_W_m2": 0.0,
                "vapor_pressure_hpa": 18.0,
                "wbgt_estimated_C": 26.5,
                "source": "Fallback baseline (Network offline)",
                "live_status": "offline_fallback",
                "error": str(e),
            }
