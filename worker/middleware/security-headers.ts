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

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  cspDirectives: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
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
