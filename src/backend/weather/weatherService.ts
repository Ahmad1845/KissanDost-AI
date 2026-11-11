import { cacheService, logger } from '../middleware/apiMiddleware.ts';

export const KP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Mardan: { lat: 34.1989, lng: 72.0404 },
  Swabi: { lat: 34.1202, lng: 72.4705 },
  Charsadda: { lat: 34.1482, lng: 71.7406 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Nowshera: { lat: 34.0153, lng: 71.9747 },
  Malakand: { lat: 34.5030, lng: 71.9304 },
};

export interface DistrictWeatherSnapshot {
  district: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  rainProbability: number;
  condition: string;
  spraySuitability: string;
  weatherAdvice: string;
}

/**
 * Dedicated Weather Retrieval Service
 * Stage 6 of the 10-Stage AI Pipeline
 */
export class WeatherService {
  async getDistrictWeather(district: string): Promise<DistrictWeatherSnapshot> {
    const normalizedDistrict = KP_COORDINATES[district] ? district : 'Mardan';
    const cacheKey = `weather:${normalizedDistrict}`;
    const cached = cacheService.get<DistrictWeatherSnapshot>(cacheKey);
    if (cached) {
      return cached;
    }

    const coords = KP_COORDINATES[normalizedDistrict];
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation_probability,wind_speed_10m&forecast_days=2&timezone=Asia%2FKarachi`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(4000) });

      if (resp.ok) {
        const data = await resp.json();
        const current = data.current || {};
        const hourlyRain = data.hourly?.precipitation_probability || [];

        const next6hRain = hourlyRain.slice(0, 6);
        const maxRainProb = next6hRain.length > 0 ? Math.max(...next6hRain) : 25;
        const avgWind = current.wind_speed_10m ?? 8;

        let spraySuitability = 'Favorable';
        let weatherAdvice = 'Clear skies and calm wind. Good time to spray.';

        if (maxRainProb > 40) {
          spraySuitability = 'Unfavorable - Delay Spraying';
          weatherAdvice = `Rain expected today (${maxRainProb}% chance). Do not spray today or rain will wash away the medicine. Wait until tomorrow morning.`;
        } else if (avgWind > 18) {
          spraySuitability = 'Unfavorable - High Wind Drift';
          weatherAdvice = `Strong wind (${avgWind} km/h). Wait for calm morning hours to spray.`;
        }

        const snapshot: DistrictWeatherSnapshot = {
          district: normalizedDistrict,
          temperature: Math.round(current.temperature_2m ?? 24),
          humidity: Math.round(current.relative_humidity_2m ?? 72),
          windSpeed: Math.round(avgWind),
          precipitation: current.precipitation ?? 0,
          rainProbability: maxRainProb,
          condition: maxRainProb > 40 ? 'Rain Expected' : avgWind > 15 ? 'Windy' : 'Clear & Sunny',
          spraySuitability,
          weatherAdvice,
        };

        cacheService.set(cacheKey, snapshot, 300);
        return snapshot;
      }
    } catch (err: any) {
      logger.warn('OPEN_METEO_FALLBACK', { district: normalizedDistrict, error: err?.message });
    }

    const fallback: DistrictWeatherSnapshot = {
      district: normalizedDistrict,
      temperature: 25,
      humidity: 68,
      windSpeed: 7,
      precipitation: 0,
      rainProbability: 20,
      condition: 'Clear & Mild',
      spraySuitability: 'Favorable',
      weatherAdvice: 'Pleasant weather (25°C) with light breeze. Safe to spray in the morning.',
    };
    cacheService.set(cacheKey, fallback, 120);
    return fallback;
  }
}

export const weatherService = new WeatherService();
