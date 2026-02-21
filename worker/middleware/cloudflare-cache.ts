import type { Context, Next } from 'hono';

interface CloudflareCacheConfig {
  browserTTL?: number;
  cdnTTL?: number;
  staleWhileRevalidate?: number;
}

export function cloudflareCache(config: CloudflareCacheConfig = {}) {
  const {
    browserTTL = 0,
    cdnTTL = 0,
    staleWhileRevalidate = 0,
  } = config;

  return async (c: Context, next: Next) => {
    await next();

    const response = c.res;
    
    const cacheControlParts: string[] = [];
    
    if (browserTTL === 0) {
      cacheControlParts.push('no-store');
    } else {
      cacheControlParts.push(`max-age=${browserTTL}`);
    }
    
    if (staleWhileRevalidate > 0) {
      cacheControlParts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
    }
    
    if (cacheControlParts.length > 0) {
      response.headers.set('Cache-Control', cacheControlParts.join(', '));
    }
    
    if (cdnTTL > 0) {
      response.headers.set('CDN-Cache-Control', `max-age=${cdnTTL}`);
    } else {
      response.headers.set('CDN-Cache-Control', 'no-store');
    }
    
    response.headers.set('Vary', 'Accept-Encoding, Origin');
  };
}

export function publicCache() {
  return cloudflareCache({
    browserTTL: 300,
    cdnTTL: 3600,
    staleWhileRevalidate: 86400,
  });
}

export function healthCheckCache() {
  return cloudflareCache({
    browserTTL: 0,
    cdnTTL: 0,
  });
}
