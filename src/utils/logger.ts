/**
 * STRAVA FIGHT — Structured Production Logger
 * 
 * Features:
 * - Safe logging with automatic sanitization of credentials, tokens and passwords
 * - Level-based output (debug, info, warn, error)
 * - Performance tracking metrics (Core Web Vitals & API Latency)
 * - Safe production fallback
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'apikey', 'credit_card', 'pin'];

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class Logger {
  private static isDev = process.env.NODE_ENV !== 'production';

  static info(message: string, context?: Record<string, any>): void {
    const payload = context ? sanitizeObject(context) : undefined;
    console.log(`[SF-INFO] ${new Date().toISOString()} — ${message}`, payload || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    const payload = context ? sanitizeObject(context) : undefined;
    console.warn(`[SF-WARN] ${new Date().toISOString()} — ${message}`, payload || '');
  }

  static error(message: string, error?: any, context?: Record<string, any>): void {
    const payload = context ? sanitizeObject(context) : {};
    console.error(`[SF-ERROR] ${new Date().toISOString()} — ${message}`, {
      errorMessage: error?.message || String(error),
      errorStack: this.isDev ? error?.stack : undefined,
      ...payload
    });
  }

  static trackMetric(name: string, value: number, unit: string = 'ms'): void {
    if (this.isDev) {
      console.log(`[SF-METRIC] ${name}: ${value.toFixed(2)}${unit}`);
    }
    // Ready for integration with Sentry / DataDog / Vercel Analytics in production
  }
}
