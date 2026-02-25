# Cloudflare Cache API Configuration

## Overview

The application uses **Cloudflare Cache API** for edge caching of public content:

- **Edge Caching**: Responses cached at Cloudflare edge locations
- **Cache Headers**: Proper `Cache-Control` and `CDN-Cache-Control` headers
- **X-Cache-Status**: Debug header showing HIT/MISS status
- **Automatic Background Population**: Cache populated via `waitUntil`

## Cache Middleware

Located in `worker/middleware/cloudflare-cache.ts`:

- `cloudflareCache(config)`: Base middleware with configurable options
- `publicCache()`: Header-only cache for CDN caching
- `publicCacheWithEdgeCache()`: Full Cache API integration for public routes
- `healthCheckCache()`: No-cache configuration for health endpoints

## Configuration Options

```typescript
interface CloudflareCacheConfig {
  browserTTL?: number // Browser cache duration (seconds)
  cdnTTL?: number // CDN/edge cache duration (seconds)
  staleWhileRevalidate?: number // SWR window (seconds)
  staleIfError?: number // Stale-on-error window (seconds)
  useCacheAPI?: boolean // Enable Cache API integration
  cacheKey?: (c: Context) => string // Custom cache key generator
}
```

## Cached Public Routes

The following public routes use edge caching:

| Route                      | Browser TTL | CDN TTL | SWR    |
| -------------------------- | ----------- | ------- | ------ |
| `/api/public/profile`      | 300s        | 3600s   | 86400s |
| `/api/public/services`     | 300s        | 3600s   | 86400s |
| `/api/public/achievements` | 300s        | 3600s   | 86400s |
| `/api/public/facilities`   | 300s        | 3600s   | 86400s |
| `/api/public/news`         | 300s        | 3600s   | 86400s |
| `/api/public/news/:id`     | 300s        | 3600s   | 86400s |
| `/api/public/gallery`      | 300s        | 3600s   | 86400s |
| `/api/public/work`         | 300s        | 3600s   | 86400s |
| `/api/public/links`        | 300s        | 3600s   | 86400s |
| `/api/public/downloads`    | 300s        | 3600s   | 86400s |

## Benefits

- Reduced origin requests for public content
- Faster response times from edge locations
- Lower latency for global users
- Reduced load on Durable Objects
- Better user experience with stale-while-revalidate

## Implementation Details

- Uses `caches.default` API available in Cloudflare Workers
- Cache population happens via `waitUntil` to not block response
- `X-Cache-Status` header indicates HIT (cached) or MISS (fresh)
- Graceful fallback when Cache API is not available
