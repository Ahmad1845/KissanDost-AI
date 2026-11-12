import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from app.utils.logger import logger

KP_COORDINATES: Dict[str, Dict[str, float]] = {
    "Mardan": {"lat": 34.1989, "lng": 72.0404},
    "Swabi": {"lat": 34.1202, "lng": 72.4705},
    "Charsadda": {"lat": 34.1482, "lng": 71.7406},
    "Peshawar": {"lat": 34.0151, "lng": 71.5249},
    "Nowshera": {"lat": 34.0153, "lng": 71.9747},
    "Malakand": {"lat": 34.5030, "lng": 71.9304},
    "Swat": {"lat": 35.2227, "lng": 72.4258},
    "Dera Ismail Khan": {"lat": 31.8626, "lng": 70.9019},
    "Mansehra": {"lat": 34.3313, "lng": 73.1980},
}


class WeatherService:
    """Stage 6: Async Google Maps Platform Weather API + Time-Indexed Open-Meteo Engine."""

    def __init__(self) -> None:
        self._cache: Dict[str, Dict[str, Any]] = {}

    async def _fetch_google_weather(
        self, district: str, coords: Dict[str, float], api_key: str
    ) -> Optional[Dict[str, Any]]:
        current_url = (
            f"https://weather.googleapis.com/v1/currentConditions:lookup"
            f"?key={api_key}&location.latitude={coords['lat']}&location.longitude={coords['lng']}&unitsSystem=METRIC"
        )
        hourly_url = (
            f"https://weather.googleapis.com/v1/forecast/hours:lookup"
            f"?key={api_key}&location.latitude={coords['lat']}&location.longitude={coords['lng']}&hours=6&unitsSystem=METRIC"
        )
        headers = {"X-Goog-Maps-Solution-ID": "gmp_git_agentskills_v1"}
        async with httpx.AsyncClient(timeout=4.5, headers=headers) as client:
            resp = await client.get(current_url)
            if resp.status_code != 200:
                return None
            current = resp.json()
            hourly_resp = await client.get(hourly_url)
            hourly = hourly_resp.json() if hourly_resp.status_code == 200 else {}

            temp = round(float(current.get("temperature", {}).get("degrees", 25)))
            humidity = round(float(current.get("relativeHumidity", 60)))
            wind = round(float(current.get("wind", {}).get("speed", {}).get("value", 6)))
            current_prob = int(current.get("precipitation", {}).get("probability", {}).get("percent", 0))
            precip = float(current.get("precipitation", {}).get("qpf", {}).get("quantity", 0.0))

            max_rain = current_prob
            for hr in hourly.get("forecastHours", [])[:6]:
                hr_prob = int(hr.get("precipitation", {}).get("probability", {}).get("percent", 0))
                if hr_prob > max_rain:
                    max_rain = hr_prob

            condition_text = (
                current.get("weatherCondition", {}).get("description", {}).get("text")
                or ("Rain Expected" if max_rain > 45 else "Clear & Sunny")
            )

            suitability = "Favorable"
            advice = f"Clear skies ({temp}°C, wind {wind} km/h). Safe window to spray."
            if precip > 0.2 or max_rain > 45:
                suitability = "Unfavorable - Delay Spraying"
                advice = f"Rain risk ({max_rain}% chance in next 6h). Delay spraying until clear morning hours."
            elif wind > 18:
                suitability = "Unfavorable - High Wind Drift"
                advice = f"Strong wind ({wind} km/h). Wait for calm morning hours."

            return {
                "district": district,
                "temperature": temp,
                "humidity": humidity,
                "windSpeed": wind,
                "precipitation": precip,
                "rainProbability": max_rain,
                "condition": condition_text,
                "spraySuitability": suitability,
                "weatherAdvice": advice,
            }

    async def get_district_weather(self, district: str) -> Dict[str, Any]:
        normalized = district if district in KP_COORDINATES else "Mardan"
        coords = KP_COORDINATES[normalized]
        google_key = (
            os.getenv("GOOGLE_MAPS_PLATFORM_KEY")
            or os.getenv("GOOGLE_WEATHER_API_KEY")
            or os.getenv("VITE_GOOGLE_MAPS_API_KEY")
            or ""
        ).strip()

        if google_key and not google_key.startswith("your_"):
            try:
                g_result = await self._fetch_google_weather(normalized, coords, google_key)
                if g_result:
                    return g_result
            except Exception as exc:
                logger.warning("GOOGLE_WEATHER_FALLBACK", district=normalized, error=str(exc))

        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={coords['lat']}&longitude={coords['lng']}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
            f"&hourly=precipitation_probability,precipitation,weather_code,wind_speed_10m&forecast_days=2&timezone=Asia%2FKarachi"
        )
        try:
            async with httpx.AsyncClient(timeout=4.5) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    current = data.get("current", {})
                    current_time_prefix = str(current.get("time", ""))[:13]
                    hourly_times = data.get("hourly", {}).get("time", [])
                    hourly_rain_all = data.get("hourly", {}).get("precipitation_probability", [])

                    start_idx = next(
                        (i for i, t in enumerate(hourly_times) if str(t).startswith(current_time_prefix)),
                        (datetime.now(timezone.utc).hour + 5) % 24,
                    )
                    next_6h_rain = hourly_rain_all[start_idx : start_idx + 6]
                    max_rain = max(next_6h_rain) if next_6h_rain else 0
                    precip = float(current.get("precipitation", 0.0))
                    if precip > 0.2 and max_rain < 60:
                        max_rain = 75

                    wind = round(float(current.get("wind_speed_10m", 6)))
                    temp = round(float(current.get("temperature_2m", 25)))

                    suitability = "Favorable"
                    advice = f"Clear skies ({temp}°C, wind {wind} km/h). Safe time to spray."
                    if precip > 0.2 or max_rain > 45:
                        suitability = "Unfavorable - Delay Spraying"
                        advice = f"Rain risk in next 6 hours ({max_rain}% chance). Delay spraying until clear morning."
                    elif wind > 18:
                        suitability = "Unfavorable - High Wind Drift"
                        advice = f"Strong wind ({wind} km/h). Wait for calm morning hours."

                    return {
                        "district": normalized,
                        "temperature": temp,
                        "humidity": round(float(current.get("relative_humidity_2m", 60))),
                        "windSpeed": wind,
                        "precipitation": precip,
                        "rainProbability": int(max_rain),
                        "condition": "Rain Expected" if (precip > 0.2 or max_rain > 45) else "Clear & Sunny",
                        "spraySuitability": suitability,
                        "weatherAdvice": advice,
                    }
        except Exception as exc:
            logger.warning("WEATHER_API_FALLBACK", district=normalized, error=str(exc))

        return {
            "district": normalized,
            "temperature": 25,
            "humidity": 58,
            "windSpeed": 6,
            "precipitation": 0.0,
            "rainProbability": 5,
            "condition": "Clear & Mild",
            "spraySuitability": "Favorable",
            "weatherAdvice": "Pleasant weather (25°C) with light breeze. Safe to spray in the morning.",
        }


weather_service = WeatherService()
