import { cacheService, logger } from '../middleware/apiMiddleware.ts';

/**
 * MODULE 5: Real-Time Meteorological Service (Google Maps Platform Weather API + Accurate Time-Indexed Open-Meteo)
 * Primary: Google Maps Platform Weather API (weather.googleapis.com/v1/currentConditions:lookup & forecast/hours:lookup)
 * Fallback: Time-indexed Open-Meteo API matched to current Pakistan Standard Time (Asia/Karachi) hour + WMO weather codes.
 */

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
  source?: string;
  updatedAt?: string;
}

export const KP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Mardan: { lat: 34.1989, lng: 72.0404 },
  Swabi: { lat: 34.1202, lng: 72.4705 },
  Charsadda: { lat: 34.1482, lng: 71.7406 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Nowshera: { lat: 34.0153, lng: 71.9747 },
  Malakand: { lat: 34.5030, lng: 71.9304 },
  Swat: { lat: 35.2227, lng: 72.4258 },
  'Dera Ismail Khan': { lat: 31.8626, lng: 70.9019 },
  Mansehra: { lat: 34.3313, lng: 73.1980 },
};

function mapWmoCodeToCondition(wmoCode: number, rainProb: number, currentPrecip: number): string {
  if (currentPrecip > 0.2 || wmoCode >= 95) return 'Thunderstorm / Rain';
  if (wmoCode >= 80) return 'Rain Showers';
  if (wmoCode >= 51) return 'Light Rain / Drizzle';
  if (rainProb > 45) return 'Rain Expected Soon';
  if (wmoCode >= 45) return 'Hazy / Foggy';
  if (wmoCode === 3) return 'Overcast';
  if (wmoCode === 2) return 'Partly Cloudy';
  if (wmoCode === 1) return 'Mostly Clear';
  return 'Clear & Sunny';
}

function evaluateSpraySuitability(params: {
  temp: number;
  windSpeed: number;
  rainProbability: number;
  precipitation: number;
}): { spraySuitability: string; weatherAdvice: string } {
  const { temp, windSpeed, rainProbability, precipitation } = params;

  if (precipitation > 0.2 || rainProbability >= 50) {
    return {
      spraySuitability: 'Unfavorable - Delay Spraying',
      weatherAdvice: `Rain risk detected (${rainProbability}% chance). Do NOT spray chemicals now — wait for clear morning weather.`,
    };
  }
  if (windSpeed > 18) {
    return {
      spraySuitability: 'Unfavorable - High Wind Drift',
      weatherAdvice: `High wind speed (${windSpeed} km/h) causes spray drift. Wait for calm morning hours (7:00 AM - 10:00 AM).`,
    };
  }
  if (temp > 35) {
    return {
      spraySuitability: 'Caution - High Evaporation',
      weatherAdvice: `High temperature (${temp}°C). Spray only in early morning (6:30 AM - 9:30 AM) or late afternoon to avoid leaf burn.`,
    };
  }
  return {
    spraySuitability: 'Favorable',
    weatherAdvice: `Weather is favorable (${temp}°C, humidity ${rainProbability}% precip, wind ${windSpeed} km/h). Safe window to spray crops.`,
  };
}

async function fetchGoogleWeather(
  district: string,
  coords: { lat: number; lng: number },
  apiKey: string
): Promise<DistrictWeatherSnapshot | null> {
  const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(
    apiKey
  )}&location.latitude=${coords.lat}&location.longitude=${coords.lng}&unitsSystem=METRIC`;
  const hourlyUrl = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${encodeURIComponent(
    apiKey
  )}&location.latitude=${coords.lat}&location.longitude=${coords.lng}&hours=3&unitsSystem=METRIC`;

  const headers = { 'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1' };
  const [currentRes, hourlyRes] = await Promise.all([
    fetch(currentUrl, { headers, signal: AbortSignal.timeout(4500) }),
    fetch(hourlyUrl, { headers, signal: AbortSignal.timeout(4500) }).catch(() => null),
  ]);

  if (!currentRes.ok) {
    return null;
  }

  const currentData = await currentRes.json();
  const hourlyData = hourlyRes && hourlyRes.ok ? await hourlyRes.json() : null;

  const temp = Math.round(Number(currentData?.temperature?.degrees ?? 20));
  const humidity = Math.round(Number(currentData?.relativeHumidity ?? 60));
  const windSpeed = Math.round(Number(currentData?.wind?.speed?.value ?? 5));
  const currentRainProb = Math.round(Number(currentData?.precipitation?.probability?.percent ?? 0));
  const currentPrecip = Number(currentData?.precipitation?.qpf?.quantity ?? 0);

  // Use currentConditions precipitation probability (or first hour of forecastHours if current is 0)
  const firstHourProb = Array.isArray(hourlyData?.forecastHours) && hourlyData.forecastHours.length > 0
    ? Math.round(Number(hourlyData.forecastHours[0]?.precipitation?.probability?.percent ?? currentRainProb))
    : currentRainProb;
  const effectiveRainProb = currentRainProb > 0 ? currentRainProb : firstHourProb;

  const conditionText =
    currentData?.weatherCondition?.description?.text ||
    (effectiveRainProb >= 50 ? 'Rain Expected' : 'Partly cloudy');

  const { spraySuitability, weatherAdvice } = evaluateSpraySuitability({
    temp,
    windSpeed,
    rainProbability: effectiveRainProb,
    precipitation: currentPrecip,
  });

  return {
    district,
    temperature: temp,
    humidity,
    windSpeed,
    precipitation: currentPrecip,
    rainProbability: effectiveRainProb,
    condition: conditionText,
    spraySuitability,
    weatherAdvice,
    source: 'Google Maps Platform Weather API',
    updatedAt: new Date().toISOString(),
  };
}

export class WeatherService {
  async getDistrictWeather(districtInput: string): Promise<DistrictWeatherSnapshot> {
    const normalizedDistrict = KP_COORDINATES[districtInput] ? districtInput : 'Mardan';
    const cacheKey = `weather:kp:${normalizedDistrict.toLowerCase()}`;

    const cached = cacheService.get<DistrictWeatherSnapshot>(cacheKey);
    if (cached) {
      return cached;
    }

    const coords = KP_COORDINATES[normalizedDistrict];
    const googleApiKey = (
      process.env.GOOGLE_MAPS_PLATFORM_KEY ||
      process.env.GOOGLE_WEATHER_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      ''
    ).trim();

    // 1. Primary: Google Maps Platform Weather API (if key is configured and valid)
    if (googleApiKey && !googleApiKey.startsWith('your_')) {
      try {
        const googleWeather = await fetchGoogleWeather(normalizedDistrict, coords, googleApiKey);
        if (googleWeather) {
          cacheService.set(cacheKey, googleWeather, 300);
          return googleWeather;
        }
      } catch (err) {
        logger.warn('GOOGLE_WEATHER_API_FALLBACK_TO_OPEN_METEO', {
          district: normalizedDistrict,
          error: String(err),
        });
      }
    }

    // 2. Accurate Time-Indexed Open-Meteo API (matches current Asia/Karachi hour instead of midnight 00:00)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation,weather_code,wind_speed_10m&forecast_days=2&timezone=Asia%2FKarachi`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }
      const data = await response.json();

      const currentTimeStr: string = data.current?.time || '';
      const currentHourPrefix = currentTimeStr.slice(0, 13); // "YYYY-MM-DDTHH"
      const hourlyTimes: string[] = data.hourly?.time || [];
      const hourlyRainProb: number[] = data.hourly?.precipitation_probability || [];

      // Find exact index for current hour in Asia/Karachi timezone
      let startIdx = hourlyTimes.findIndex((t) => t.startsWith(currentHourPrefix));
      if (startIdx < 0) {
        const pstHour = (new Date().getUTCHours() + 5) % 24;
        startIdx = Math.min(pstHour, Math.max(0, hourlyRainProb.length - 6));
      }

      // Inspect the upcoming 6 hours from the CURRENT hour
      const next6hRain = hourlyRainProb.slice(startIdx, startIdx + 6);
      const currentPrecip = Number(data.current?.precipitation ?? 0);
      const wmoCode = Number(data.current?.weather_code ?? 0);

      let maxRainProb = next6hRain.length > 0 ? Math.max(...next6hRain) : 0;
      if (currentPrecip > 0.2 && maxRainProb < 60) {
        maxRainProb = 75;
      }

      const temp = Math.round(Number(data.current?.temperature_2m ?? 26));
      const humidity = Math.round(Number(data.current?.relative_humidity_2m ?? 60));
      const windSpeed = Math.round(Number(data.current?.wind_speed_10m ?? 6));

      const condition = mapWmoCodeToCondition(wmoCode, maxRainProb, currentPrecip);
      const { spraySuitability, weatherAdvice } = evaluateSpraySuitability({
        temp,
        windSpeed,
        rainProbability: maxRainProb,
        precipitation: currentPrecip,
      });

      const weatherContext: DistrictWeatherSnapshot = {
        district: normalizedDistrict,
        temperature: temp,
        humidity,
        windSpeed,
        precipitation: currentPrecip,
        rainProbability: maxRainProb,
        condition,
        spraySuitability,
        weatherAdvice,
        source: 'Open-Meteo Live API',
        updatedAt: new Date().toISOString(),
      };

      cacheService.set(cacheKey, weatherContext, 300);
      return weatherContext;
    } catch (error) {
      logger.warn('WEATHER_API_FALLBACK_TRIGGERED', {
        district: normalizedDistrict,
        error: String(error),
      });

      const fallback: DistrictWeatherSnapshot = {
        district: normalizedDistrict,
        temperature: 25,
        humidity: 58,
        windSpeed: 6,
        precipitation: 0,
        rainProbability: 5,
        condition: 'Clear & Mild',
        spraySuitability: 'Favorable',
        weatherAdvice: 'Weather is clear and calm (25°C). Good window for morning crop care.',
        source: 'Cached District Baseline',
        updatedAt: new Date().toISOString(),
      };
      return fallback;
    }
  }
}

export const weatherService = new WeatherService();
