import type { Context, Next } from 'hono';
import { integrationMonitor } from '../integration-monitor';
import { rateLimitExceeded } from '../core-utils';
import { RateLimitMaxRequests, RateLimitWindow, TimeConstants, RateLimitStore as RateLimitStoreConfig } from '../config/time';

interface RateLimitStoreEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStoreEntry>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  maxStoreSize?: number;
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
  windowMs?: number;
  maxRequests?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: RateLimitWindow.STANDARD,
  maxRequests: RateLimitMaxRequests.STANDARD,
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
  
  const ip = c.req.header('cf-connecting-ip') || 
             c.req.header('x-real-ip') || 
             c.req.header('x-forwarded-for')?.split(',')[0].trim() || 
             'unknown';
  
  const path = c.req.path;
  return `${ip}:${path}`;
}

function getOrCreateEntry(key: string, config: RateLimitConfig): RateLimitStoreEntry {
  cleanupExpiredEntries();
  
  const maxStoreSize = config.maxStoreSize ?? RateLimitStoreConfig.MAX_ENTRIES;
  if (store.size >= maxStoreSize) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) {
      store.delete(oldestKey);
    }
  }
  
  const now = Date.now();
  const existing = store.get(key);
  
  if (existing && existing.resetTime > now) {
    return existing;
  }
  
  const entry: RateLimitStoreEntry = {
    count: 0,
    resetTime: now + config.windowMs,
  };
  
  store.set(key, entry);
  integrationMonitor.updateRateLimitEntries(store.size);
  return entry;
}

export function rateLimit(options: RateLimitMiddlewareOptions = {}) {
  const config: RateLimitConfig = {
    windowMs: options.windowMs ?? RateLimitWindow.STANDARD,
    maxRequests: options.maxRequests ?? RateLimitMaxRequests.STANDARD,
    skipFailedRequests: options.skipFailedRequests,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
  };

  const standardHeaders = options.standardHeaders ?? true;

  return async (c: Context, next: Next) => {
    const key = getKeyFromContext(c, options.keyGenerator);
    const entry = getOrCreateEntry(key, config);
    const now = Date.now();
    
    entry.count++;
    const blocked = entry.count > config.maxRequests;
    integrationMonitor.recordRateLimitRequest(blocked);
    
    const info: RateLimitInfo = {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      reset: Math.ceil(entry.resetTime / TimeConstants.SECOND_MS),
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
      
      c.header('Retry-After', Math.ceil((entry.resetTime - now) / TimeConstants.SECOND_MS).toString());
      return rateLimitExceeded(c, Math.ceil((entry.resetTime - now) / TimeConstants.SECOND_MS));
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
    windowMs: config?.windowMs ?? DEFAULT_CONFIG.windowMs,
    maxRequests: config?.maxRequests ?? DEFAULT_CONFIG.maxRequests,
    skipFailedRequests: config?.skipFailedRequests,
    skipSuccessfulRequests: config?.skipSuccessfulRequests,
  };

  return (options?: RateLimitMiddlewareOptions) => {
    return rateLimit({
      ...options,
      skipFailedRequests: mergedConfig.skipFailedRequests,
      skipSuccessfulRequests: mergedConfig.skipSuccessfulRequests,
      windowMs: mergedConfig.windowMs,
      maxRequests: mergedConfig.maxRequests,
    });
  };
}

export const defaultRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.STANDARD,
  maxRequests: RateLimitMaxRequests.STANDARD,
});

export const strictRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.STRICT,
  maxRequests: RateLimitMaxRequests.STRICT,
});

export const looseRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.LOOSE,
  maxRequests: RateLimitMaxRequests.LOOSE,
});

export const authRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.AUTH,
  maxRequests: RateLimitMaxRequests.AUTH,
});

export function clearRateLimitStore(): void {
  store.clear();
}

export function getRateLimitStore(): Map<string, RateLimitStoreEntry> {
  cleanupExpiredEntries();
  integrationMonitor.updateRateLimitEntries(store.size);
  return new Map(store);
}
