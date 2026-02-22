import type { Context, Next } from 'hono';

interface CloudflareCacheConfig {
  browserTTL?: number;
  cdnTTL?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

export function cloudflareCache(config: CloudflareCacheConfig = {}) {
  const {
    browserTTL = 0,
    cdnTTL = 0,
    staleWhileRevalidate = 0,
    staleIfError = 0,
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
    
    if (staleIfError > 0) {
      cacheControlParts.push(`stale-if-error=${staleIfError}`);
    }
    
    if (cacheControlParts.length > 0) {
      response.headers.set('Cache-Control', cacheControlParts.join(', '));
    }
    
    const cdnCacheControlParts: string[] = [];
    
    if (cdnTTL > 0) {
      cdnCacheControlParts.push(`max-age=${cdnTTL}`);
    } else {
      cdnCacheControlParts.push('no-store');
    }
    
    if (staleIfError > 0 && cdnTTL > 0) {
      cdnCacheControlParts.push(`stale-if-error=${staleIfError}`);
    }
    
    response.headers.set('CDN-Cache-Control', cdnCacheControlParts.join(', '));
    
    response.headers.set('Vary', 'Accept-Encoding, Origin');
  };
}

export function publicCache() {
  return cloudflareCache({
    browserTTL: 300,
    cdnTTL: 3600,
    staleWhileRevalidate: 86400,
    staleIfError: 300,
  });
}

export function healthCheckCache() {
  return cloudflareCache({
    browserTTL: 0,
    cdnTTL: 0,
  });
}
