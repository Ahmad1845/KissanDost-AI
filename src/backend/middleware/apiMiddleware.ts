import { Request, Response, NextFunction } from 'express';
import { settings } from '../config/settings.ts';

// ==================== STRUCTURED JSON LOGGER ====================
export const logger = {
  info(event: string, meta: Record<string, unknown> = {}) {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        service: settings.appName,
        event,
        ...meta,
      })
    );
  },
  warn(event: string, meta: Record<string, unknown> = {}) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        service: settings.appName,
        event,
        ...meta,
      })
    );
  },
  error(event: string, meta: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        service: settings.appName,
        event,
        ...meta,
      })
    );
  },
};

// ==================== TTL CACHE SERVICE (REDIS-COMPATIBLE INTERFACE) ====================
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number = settings.cacheTtlSeconds): void {
    if (this.store.size > 250) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  stats() {
    return {
      entries: this.store.size,
      ttlSeconds: settings.cacheTtlSeconds,
    };
  }
}

export const cacheService = new CacheService();

// ==================== SLIDING-WINDOW RATE LIMITER MIDDLEWARE ====================
const clientHits = new Map<string, { count: number; windowStart: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'local-client';
  const now = Date.now();
  const record = clientHits.get(clientIp);

  if (!record || now - record.windowStart > settings.rateLimitWindowMs) {
    clientHits.set(clientIp, { count: 1, windowStart: now });
    return next();
  }

  record.count += 1;
  if (record.count > settings.rateLimitMaxRequests) {
    logger.warn('RATE_LIMIT_EXCEEDED', { clientIp, path: req.path });
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment and try again.',
    });
  }

  return next();
}

// ==================== REQUEST TELEMETRY & CENTRALIZED EXCEPTION HANDLER ====================
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api/')) {
    const start = Date.now();
    res.on('finish', () => {
      logger.info('API_REQUEST', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      });
    });
  }
  next();
}

export function centralizedErrorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error('UNHANDLED_API_EXCEPTION', {
    path: req.path,
    method: req.method,
    message: err?.message || String(err),
  });

  res.status(err?.statusCode || 500).json({
    success: false,
    error: err?.code || 'INTERNAL_SERVER_ERROR',
    message: err?.message || 'An unexpected server error occurred.',
  });
}
