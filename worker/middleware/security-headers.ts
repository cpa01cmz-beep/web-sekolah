import type { Context, Next } from 'hono';
import { TimeConstants } from '../config/time';

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
// - 'unsafe-inline' in style-src: Required for dynamic styles in UI components
//
// SECURITY IMPROVEMENTS (2026-01-08):
// - ✅ Replaced 'unsafe-inline' in script-src with SHA-256 hash for known inline script
// - ✅ Removed script-src 'unsafe-inline' (major XSS risk reduction)
// - ✅ Documented remaining 'unsafe-eval' requirement (React runtime)
// - ✅ Documented style-src 'unsafe-inline' requirement (UI components)
//
// SECURITY IMPROVEMENTS (2026-01-10):
// - ✅ Added 'object-src none' to prevent object embedding
// - ✅ Added 'worker-src self' to restrict worker scripts
// - ✅ Added 'frame-src self' to restrict frame sources
// - ✅ Added 'base-uri self' for URL base restriction
// - ✅ Added 'form-action self' to restrict form submissions
// - ✅ Added 'report-uri' for CSP violation monitoring
//
// SECURITY IMPROVEMENTS (2026-01-13):
// - ✅ Updated documentation to reflect codebase state (Chart.tsx component no longer exists)
// - ✅ Removed outdated reference to Chart.tsx in comments
// - ✅ Documented style-src 'unsafe-inline' requirement for UI components
//
// FUTURE IMPROVEMENTS:
// - Consider nonce-based CSP for dynamic content (requires server-side rendering)
// - Remove 'unsafe-eval' if React runtime no longer requires it
// - Evaluate removing 'style-src 'unsafe-inline'' if not needed by current UI components

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  cspDirectives: "default-src 'self'; script-src 'self' 'sha256-1LjDIY7ayXpv8ODYzP8xZXqNvuMhUBdo39lNMQ1oGHI=' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report;",
  hstsMaxAge: TimeConstants.ONE_YEAR_MS / 1000,
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
