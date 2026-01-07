import type { Context, Next } from 'hono';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitMiddlewareOptions {
  keyGenerator?: (c: Context) => string;
  handler?: (c: Context, info: RateLimitInfo) => Response | Promise<Response>;
  onLimitReached?: (c: Context, info: RateLimitInfo) => void;
  standardHeaders?: boolean;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
};

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}

function getKeyFromContext(c: Context, customKeyGenerator?: (c: Context) => string): string {
  if (customKeyGenerator) {
    return customKeyGenerator(c);
  }
  
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
  
  const path = c.req.path;
  return `${ip}:${path}`;
}

function getOrCreateEntry(key: string, config: RateLimitConfig): RateLimitStore {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const existing = store.get(key);
  
  if (existing && existing.resetTime > now) {
    return existing;
  }
  
  const entry: RateLimitStore = {
    count: 0,
    resetTime: now + config.windowMs,
  };
  
  store.set(key, entry);
  return entry;
}

export function rateLimit(options: RateLimitMiddlewareOptions = {}) {
  const config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    skipFailedRequests: options.skipFailedRequests,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
  };

  const standardHeaders = options.standardHeaders ?? true;

  return async (c: Context, next: Next) => {
    const key = getKeyFromContext(c, options.keyGenerator);
    const entry = getOrCreateEntry(key, config);
    const now = Date.now();
    
    entry.count++;
    
    const info: RateLimitInfo = {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      reset: Math.ceil(entry.resetTime / 1000),
    };
    
    if (standardHeaders) {
      c.header('X-RateLimit-Limit', info.limit.toString());
      c.header('X-RateLimit-Remaining', info.remaining.toString());
      c.header('X-RateLimit-Reset', info.reset.toString());
    }
    
    if (entry.count > config.maxRequests) {
      if (options.onLimitReached) {
        options.onLimitReached(c, info);
      }
      
      if (options.handler) {
        return options.handler(c, info);
      }
      
      c.header('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
      return c.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        429
      );
    }
    
    await next();
    
    const status = c.res.status;
    const skip = (config.skipSuccessfulRequests && status >= 200 && status < 300) ||
                 (config.skipFailedRequests && status >= 400);
    
    if (skip) {
      entry.count--;
    }
  };
}

export function createRateLimiter(config?: Partial<RateLimitConfig>) {
  const mergedConfig: RateLimitConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return (options?: RateLimitMiddlewareOptions) => {
    return rateLimit({
      ...options,
      skipFailedRequests: mergedConfig.skipFailedRequests,
      skipSuccessfulRequests: mergedConfig.skipSuccessfulRequests,
    });
  };
}

export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 50,
});

export const looseRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 1000,
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

export function clearRateLimitStore(): void {
  store.clear();
}

export function getRateLimitStore(): Map<string, RateLimitStore> {
  cleanupExpiredEntries();
  return new Map(store);
}
