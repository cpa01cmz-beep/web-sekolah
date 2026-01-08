import type { Context, Next } from 'hono';

interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  cspDirectives?: string;
  hstsMaxAge?: number;
}

// CSP SECURITY NOTES:
// - 'unsafe-eval' in script-src: Required by React runtime (documented limitation)
// - 'sha256-...' in script-src: Hash-based CSP for inline error reporting script in index.html
// - 'unsafe-inline' in style-src: Required for chart component dynamic styles (Chart.tsx dangerouslySetInnerHTML)
//
// SECURITY IMPROVEMENTS (2026-01-08):
// - ✅ Replaced 'unsafe-inline' in script-src with SHA-256 hash for known inline script
// - ✅ Removed script-src 'unsafe-inline' (major XSS risk reduction)
// - ✅ Documented remaining 'unsafe-eval' requirement (React runtime)
// - ✅ Documented style-src 'unsafe-inline' requirement (Chart component)
//
// FUTURE IMPROVEMENTS:
// - Refactor Chart component to avoid dangerouslySetInnerHTML (eliminate style-src 'unsafe-inline')
// - Consider nonce-based CSP for dynamic content (requires server-side rendering)
// - Remove 'unsafe-eval' if React runtime no longer requires it

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  cspDirectives: "default-src 'self'; script-src 'self' 'sha256-1LjDIY7ayXpv8ODYzP8xZXqNvuMhUBdo39lNMQ1oGHI=' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  hstsMaxAge: 31536000,
};

export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const finalConfig = { ...DEFAULT_SECURITY_HEADERS, ...config };

  return async (c: Context, next: Next) => {
    await next();

    const response = c.res;

    if (finalConfig.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        `max-age=${finalConfig.hstsMaxAge}; includeSubDomains; preload`
      );
    }

    if (finalConfig.enableCSP) {
      response.headers.set('Content-Security-Policy', finalConfig.cspDirectives!);
    }

    if (finalConfig.enableXFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY');
    }

    if (finalConfig.enableXContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    if (finalConfig.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    if (finalConfig.enablePermissionsPolicy) {
      response.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
      );
    }

    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  };
}
