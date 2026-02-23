import type { Context, Next } from 'hono'

interface CloudflareCacheConfig {
  browserTTL?: number
  cdnTTL?: number
  staleWhileRevalidate?: number
  staleIfError?: number
  useCacheAPI?: boolean
  cacheKey?: (c: Context) => string
}

function getCache(): Cache | null {
  try {
    return caches.default
  } catch {
    return null
  }
}

export function cloudflareCache(config: CloudflareCacheConfig = {}) {
  const {
    browserTTL = 0,
    cdnTTL = 0,
    staleWhileRevalidate = 0,
    staleIfError = 0,
    useCacheAPI = false,
    cacheKey,
  } = config

  return async (c: Context, next: Next) => {
    if (useCacheAPI && cdnTTL > 0 && c.req.method === 'GET') {
      const cache = getCache()
      const key = cacheKey ? cacheKey(c) : c.req.url
      const cacheUrl = new URL(key)

      if (cache) {
        const cachedResponse = await cache.match(cacheUrl)

        if (cachedResponse) {
          const response = new Response(cachedResponse.body, cachedResponse)
          response.headers.set('X-Cache-Status', 'HIT')
          return response
        }
      }

      await next()

      const response = c.res.clone()

      if (response.ok && cache) {
        const headers = new Headers(response.headers)

        if (browserTTL === 0) {
          headers.set('Cache-Control', 'no-store')
        } else {
          headers.set(
            'Cache-Control',
            `max-age=${browserTTL}${staleWhileRevalidate > 0 ? `, stale-while-revalidate=${staleWhileRevalidate}` : ''}${staleIfError > 0 ? `, stale-if-error=${staleIfError}` : ''}`
          )
        }

        headers.set(
          'CDN-Cache-Control',
          `max-age=${cdnTTL}${staleIfError > 0 ? `, stale-if-error=${staleIfError}` : ''}`
        )
        headers.set('X-Cache-Status', 'MISS')
        headers.set('Vary', 'Accept-Encoding, Origin')

        const cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })

        c.executionCtx?.waitUntil?.(cache.put(cacheUrl, cachedResponse))
      }

      c.res.headers.set('X-Cache-Status', 'MISS')
    } else {
      await next()
    }

    const response = c.res

    if (!useCacheAPI || cdnTTL === 0) {
      const cacheControlParts: string[] = []

      if (browserTTL === 0) {
        cacheControlParts.push('no-store')
      } else {
        cacheControlParts.push(`max-age=${browserTTL}`)
      }

      if (staleWhileRevalidate > 0) {
        cacheControlParts.push(`stale-while-revalidate=${staleWhileRevalidate}`)
      }

      if (staleIfError > 0) {
        cacheControlParts.push(`stale-if-error=${staleIfError}`)
      }

      if (cacheControlParts.length > 0) {
        response.headers.set('Cache-Control', cacheControlParts.join(', '))
      }

      const cdnCacheControlParts: string[] = []

      if (cdnTTL > 0) {
        cdnCacheControlParts.push(`max-age=${cdnTTL}`)
      } else {
        cdnCacheControlParts.push('no-store')
      }

      if (staleIfError > 0 && cdnTTL > 0) {
        cdnCacheControlParts.push(`stale-if-error=${staleIfError}`)
      }

      response.headers.set('CDN-Cache-Control', cdnCacheControlParts.join(', '))

      response.headers.set('Vary', 'Accept-Encoding, Origin')
    }
  }
}

export function publicCache() {
  return cloudflareCache({
    browserTTL: 300,
    cdnTTL: 3600,
    staleWhileRevalidate: 86400,
    staleIfError: 300,
  })
}

export function publicCacheWithEdgeCache() {
  return cloudflareCache({
    browserTTL: 300,
    cdnTTL: 3600,
    staleWhileRevalidate: 86400,
    staleIfError: 300,
    useCacheAPI: true,
  })
}

export function healthCheckCache() {
  return cloudflareCache({
    browserTTL: 0,
    cdnTTL: 0,
  })
}
