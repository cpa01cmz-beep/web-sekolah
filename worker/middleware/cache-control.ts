import type { Context, Next } from 'hono';

interface CacheControlConfig {
  maxAge?: number;
  sMaxAge?: number;
  noStore?: boolean;
  noCache?: boolean;
  private?: boolean;
  mustRevalidate?: boolean;
  staleWhileRevalidate?: number;
}

function formatCacheControl(config: CacheControlConfig): string {
  const directives: string[] = [];

  if (config.noStore) {
    directives.push('no-store');
  }
  if (config.noCache) {
    directives.push('no-cache');
  }
  if (config.private) {
    directives.push('private');
  }
  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }
  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }
  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }
  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (directives.length === 0) {
    return 'no-store, no-cache, must-revalidate';
  }

  return directives.join(', ');
}

export function cacheControl(config: CacheControlConfig = {}) {
  return async (c: Context, next: Next) => {
    await next();

    if (!c.res.headers.has('Cache-Control')) {
      c.header('Cache-Control', formatCacheControl(config));
    }
  };
}

export const noCacheMiddleware = cacheControl({
  noStore: true,
  noCache: true,
  mustRevalidate: true,
});

export const shortCacheMiddleware = cacheControl({
  maxAge: 60,
  staleWhileRevalidate: 300,
});

export const publicCacheMiddleware = cacheControl({
  maxAge: 300,
  sMaxAge: 600,
  staleWhileRevalidate: 3600,
});
