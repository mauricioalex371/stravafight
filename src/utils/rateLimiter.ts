/**
 * STRAVA FIGHT — Rate Limiter (Token Bucket / Sliding Window)
 * 
 * Protects user interactions from abusive bot behavior, double-clicks, and spam loops:
 * - Comments: max 5 per minute
 * - Likes: max 20 per 10 seconds
 * - Messages: max 15 per minute
 * - Reports: max 3 per 5 minutes
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  friendlyMessage: string;
}

const ACTION_CONFIGS: Record<string, RateLimitConfig> = {
  COMMENT: {
    maxAttempts: 5,
    windowMs: 60 * 1000,
    friendlyMessage: 'Você está comentando muito rápido. Aguarde um minuto antes de comentar novamente.'
  },
  LIKE: {
    maxAttempts: 25,
    windowMs: 10 * 1000,
    friendlyMessage: 'Muitas curtidas em sequência. Respire um instante antes de continuar.'
  },
  MESSAGE: {
    maxAttempts: 15,
    windowMs: 60 * 1000,
    friendlyMessage: 'Limite de mensagens temporariamente atingido para evitar spam. Aguarde 60 segundos.'
  },
  REPORT: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000,
    friendlyMessage: 'Você já enviou denúncias recentemente. Nossa equipe já está analisando.'
  },
  CHECK_IN: {
    maxAttempts: 3,
    windowMs: 60 * 1000,
    friendlyMessage: 'Aguarde antes de registrar outro check-in.'
  }
};

const actionTimestamps = new Map<string, number[]>();

export class RateLimiter {
  /**
   * Checks if an action is permitted for the given key (e.g. userId + actionType).
   * Returns { allowed: true } or { allowed: false, message: string, retryAfterSeconds: number }.
   */
  static check(action: keyof typeof ACTION_CONFIGS, key: string): { allowed: boolean; message?: string; retryAfterSeconds?: number } {
    const config = ACTION_CONFIGS[action];
    if (!config) return { allowed: true };

    const fullKey = `${action}:${key}`;
    const now = Date.now();
    const timestamps = actionTimestamps.get(fullKey) || [];

    // Filter out timestamps outside the active window
    const windowStart = now - config.windowMs;
    const activeTimestamps = timestamps.filter((t) => t > windowStart);

    if (activeTimestamps.length >= config.maxAttempts) {
      const oldestActive = activeTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestActive + config.windowMs - now) / 1000);
      return {
        allowed: false,
        message: config.friendlyMessage,
        retryAfterSeconds: Math.max(retryAfterSeconds, 1)
      };
    }

    // Record this attempt
    activeTimestamps.push(now);
    actionTimestamps.set(fullKey, activeTimestamps);
    return { allowed: true };
  }

  /**
   * Resets the rate limit counters (useful for unit tests or admin overrides).
   */
  static reset(key?: string): void {
    if (key) {
      for (const k of actionTimestamps.keys()) {
        if (k.endsWith(`:${key}`)) {
          actionTimestamps.delete(k);
        }
      }
    } else {
      actionTimestamps.clear();
    }
  }
}
