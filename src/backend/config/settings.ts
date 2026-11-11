import dotenv from 'dotenv';

dotenv.config();

export interface BackendSettings {
  appName: string;
  version: string;
  environment: string;
  port: number;
  geminiApiKey: string;
  geminiVisionModel: string;
  geminiTtsPrimaryModel: string;
  geminiTtsFallbackModel: string;
  geminiTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  cacheTtlSeconds: number;
  jwtSecretKey: string;
}

export const settings: BackendSettings = {
  appName: 'KissanDost AI Microservice Backend',
  version: '3.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiVisionModel: process.env.GEMINI_VISION_MODEL || 'gemini-3.8-flash',
  geminiTtsPrimaryModel: process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts',
  geminiTtsFallbackModel: 'gemini-3.8-flash-lite-tts',
  geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 5500,
  rateLimitWindowMs: 60 * 1000,
  rateLimitMaxRequests: 120,
  cacheTtlSeconds: 300,
  jwtSecretKey: process.env.JWT_SECRET_KEY || 'kissandost-kp-agri-secret-2026',
};
