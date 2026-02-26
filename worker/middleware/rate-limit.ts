import type { Context, Next } from 'hono'
import type { Env, GlobalDurableObject } from '../types'
import { integrationMonitor } from '../integration-monitor'
import { rateLimitExceeded } from '../core-utils'
import {
  RateLimitMaxRequests,
  RateLimitWindow,
  TimeConstants,
  RateLimitStore as RateLimitStoreConfig,
} from '../config/time'

interface RateLimitStoreEntry {
  count: number
  resetTime: number
}

const RATE_LIMIT_PREFIX = 'rl:'
const LOCAL_CACHE_TTL = 1000

interface LocalCacheEntry {
  entry: RateLimitStoreEntry
  timestamp: number
}

let localCache: Map<string, LocalCacheEntry> = new Map()
let cacheInitialized = false

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  maxStoreSize?: number
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

export interface RateLimitMiddlewareOptions {
  keyGenerator?: (c: Context) => string
  handler?: (c: Context, info: RateLimitInfo) => Response | Promise<Response>
  onLimitReached?: (c: Context, info: RateLimitInfo) => void
  standardHeaders?: boolean
  skipFailedRequests?: boolean
  skipSuccessfulRequests?: boolean
  windowMs?: number
  maxRequests?: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: RateLimitWindow.STANDARD,
  maxRequests: RateLimitMaxRequests.STANDARD,
}

function getRateLimitStub(env: Env) {
  if (!env.GlobalDurableObject) {
    return null
  }
  const doId = env.GlobalDurableObject.idFromName('rate-limit')
  return env.GlobalDurableObject.get(doId)
}

async function incrementCountInDO(
  stub: NonNullable<ReturnType<typeof getRateLimitStub>>,
  key: string,
  windowMs: number,
  maxRequests: number
): Promise<{ entry: RateLimitStoreEntry; blocked: boolean }> {
  const fullKey = RATE_LIMIT_PREFIX + key
  const now = Date.now()

  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await stub.getDoc(fullKey)
    let entry: RateLimitStoreEntry

    if (current && current.data && typeof current.data === 'object') {
      entry = current.data as RateLimitStoreEntry
      if (entry.resetTime < now) {
        entry = { count: 1, resetTime: now + windowMs }
      } else {
        entry = { ...entry, count: entry.count + 1 }
      }
    } else {
      entry = { count: 1, resetTime: now + windowMs }
    }

    const blocked = entry.count > maxRequests
    const res = await stub.casPut(fullKey, current?.v ?? 0, entry)
    if (res.ok) {
      return { entry, blocked }
    }
  }

  throw new Error('Concurrent modification of rate limit entry')
}

async function decrementCountInDO(
  stub: NonNullable<ReturnType<typeof getRateLimitStub>>,
  key: string
): Promise<void> {
  const fullKey = RATE_LIMIT_PREFIX + key
  const now = Date.now()

  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await stub.getDoc(fullKey)
    if (!current || !current.data || typeof current.data !== 'object') {
      return
    }

    const entry = current.data as RateLimitStoreEntry
    if (entry.resetTime < now) {
      return
    }

    const newEntry = { ...entry, count: Math.max(0, entry.count - 1) }
    const res = await stub.casPut(fullKey, current.v, newEntry)
    if (res.ok) {
      return
    }
  }
}

function getKeyFromContext(c: Context, customKeyGenerator?: (c: Context) => string): string {
  if (customKeyGenerator) {
    return customKeyGenerator(c)
  }

  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'

  const path = c.req.path
  return `${ip}:${path}`
}

function getLocalCacheEntry(key: string): RateLimitStoreEntry | null {
  const cached = localCache.get(key)
  if (cached && Date.now() - cached.timestamp < LOCAL_CACHE_TTL) {
    return cached.entry
  }
  return null
}

function setLocalCacheEntry(key: string, entry: RateLimitStoreEntry): void {
  if (!cacheInitialized) {
    localCache = new Map()
    cacheInitialized = true
  }
  localCache.set(key, { entry, timestamp: Date.now() })

  if (localCache.size > RateLimitStoreConfig.MAX_ENTRIES) {
    const firstKey = localCache.keys().next().value
    if (firstKey) {
      localCache.delete(firstKey)
    }
  }
}

function cleanupExpiredLocalEntries(): void {
  const now = Date.now()
  for (const [key, value] of localCache.entries()) {
    if (value.entry.resetTime < now) {
      localCache.delete(key)
    }
  }
}

function useInMemoryStore(env: Env | undefined): boolean {
  return !env || !env.GlobalDurableObject
}

function getOrCreateInMemoryEntry(key: string, config: RateLimitConfig): RateLimitStoreEntry {
  cleanupExpiredLocalEntries()

  const maxStoreSize = config.maxStoreSize ?? RateLimitStoreConfig.MAX_ENTRIES
  if (localCache.size >= maxStoreSize) {
    const firstKey = localCache.keys().next().value
    if (firstKey) {
      localCache.delete(firstKey)
    }
  }

  const now = Date.now()
  const cached = localCache.get(key)

  if (cached && cached.entry.resetTime > now) {
    return cached.entry
  }

  const entry: RateLimitStoreEntry = {
    count: 0,
    resetTime: now + config.windowMs,
  }

  localCache.set(key, { entry, timestamp: now })
  return entry
}

export function rateLimit(options: RateLimitMiddlewareOptions = {}) {
  const config: RateLimitConfig = {
    windowMs: options.windowMs ?? RateLimitWindow.STANDARD,
    maxRequests: options.maxRequests ?? RateLimitMaxRequests.STANDARD,
    skipFailedRequests: options.skipFailedRequests,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
  }

  const standardHeaders = options.standardHeaders ?? true

  return async (c: Context, next: Next) => {
    const env = c.env as Env | undefined
    const useMemory = useInMemoryStore(env)

    const key = getKeyFromContext(c, options.keyGenerator)
    let entry: RateLimitStoreEntry
    let blocked = false

    if (useMemory) {
      entry = getOrCreateInMemoryEntry(key, config)
      entry.count++
      blocked = entry.count > config.maxRequests
      setLocalCacheEntry(key, entry)
    } else {
      const stub = getRateLimitStub(env)
      if (!stub) {
        await next()
        return
      }

      const cached = getLocalCacheEntry(key)
      if (cached && cached.resetTime > Date.now()) {
        entry = cached
        blocked = entry.count > config.maxRequests
      } else {
        try {
          const result = await incrementCountInDO(stub, key, config.windowMs, config.maxRequests)
          entry = result.entry
          blocked = result.blocked
          setLocalCacheEntry(key, entry)
        } catch {
          await next()
          return
        }
      }
    }

    const now = Date.now()
    integrationMonitor.recordRateLimitRequest(blocked)

    const info: RateLimitInfo = {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      reset: Math.ceil(entry.resetTime / TimeConstants.SECOND_MS),
    }

    if (standardHeaders) {
      c.header('X-RateLimit-Limit', info.limit.toString())
      c.header('X-RateLimit-Remaining', info.remaining.toString())
      c.header('X-RateLimit-Reset', info.reset.toString())
    }

    if (blocked) {
      if (options.onLimitReached) {
        options.onLimitReached(c, info)
      }

      if (options.handler) {
        return options.handler(c, info)
      }

      c.header('Retry-After', Math.ceil((entry.resetTime - now) / TimeConstants.SECOND_MS))
      return rateLimitExceeded(c, Math.ceil((entry.resetTime - now) / TimeConstants.SECOND_MS))
    }

    await next()

    const status = c.res.status
    const skip =
      (config.skipSuccessfulRequests && status >= 200 && status < 300) ||
      (config.skipFailedRequests && status >= 400)

    if (skip) {
      if (useMemory) {
        entry.count = Math.max(0, entry.count - 1)
        setLocalCacheEntry(key, entry)
      } else {
        const stub = getRateLimitStub(env)
        if (stub) {
          try {
            await decrementCountInDO(stub, key)
            if (entry) {
              entry.count = Math.max(0, entry.count - 1)
              setLocalCacheEntry(key, entry)
            }
          } catch {
            // Best effort
          }
        }
      }
    }
  }
}

export function createRateLimiter(config?: Partial<RateLimitConfig>) {
  const mergedConfig: RateLimitConfig = {
    ...DEFAULT_CONFIG,
    windowMs: config?.windowMs ?? DEFAULT_CONFIG.windowMs,
    maxRequests: config?.maxRequests ?? DEFAULT_CONFIG.maxRequests,
    skipFailedRequests: config?.skipFailedRequests,
    skipSuccessfulRequests: config?.skipSuccessfulRequests,
  }

  return (options?: RateLimitMiddlewareOptions) => {
    return rateLimit({
      ...options,
      skipFailedRequests: mergedConfig.skipFailedRequests,
      skipSuccessfulRequests: mergedConfig.skipSuccessfulRequests,
      windowMs: mergedConfig.windowMs,
      maxRequests: mergedConfig.maxRequests,
    })
  }
}

export const defaultRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.STANDARD,
  maxRequests: RateLimitMaxRequests.STANDARD,
})

export const strictRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.STRICT,
  maxRequests: RateLimitMaxRequests.STRICT,
})

export const looseRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.LOOSE,
  maxRequests: RateLimitMaxRequests.LOOSE,
})

export const authRateLimiter = createRateLimiter({
  windowMs: RateLimitWindow.AUTH,
  maxRequests: RateLimitMaxRequests.AUTH,
})

export function clearRateLimitStore(): void {
  localCache.clear()
  cacheInitialized = false
}

export function getRateLimitStore(): Map<string, RateLimitStoreEntry> {
  cleanupExpiredLocalEntries()
  const result = new Map<string, RateLimitStoreEntry>()
  for (const [key, value] of localCache.entries()) {
    result.set(key, value.entry)
  }
  return result
}

export async function clearRateLimitStoreDO(_env: Env): Promise<void> {
  localCache.clear()
  cacheInitialized = false
}

export async function getRateLimitStoreSizeDO(_env: Env): Promise<number> {
  cleanupExpiredLocalEntries()
  return localCache.size
}
