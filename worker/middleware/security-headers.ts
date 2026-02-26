import type { Context, Next } from 'hono'

interface SecurityHeadersConfig {
  enableHSTS?: boolean
  enableCSP?: boolean
  enableXFrameOptions?: boolean
  enableXContentTypeOptions?: boolean
  enableReferrerPolicy?: boolean
  enablePermissionsPolicy?: boolean
  enableCSPReportOnly?: boolean
  cspDirectives?: string
  cspReportOnlyDirectives?: string
  hstsMaxAge?: number
}

function generateNonce(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).slice(0, 32)
}

const CSP_INLINE_SCRIPT_HASH = "'sha256-xsWpBSh+88Gpp+H1+XSGjqLj67OrRo+q9tmTvaO4nhs='"

// CSP SECURITY NOTES:
// - 'unsafe-eval' in script-src: Required by React runtime (documented limitation)
// - sha256 hash in script-src: Hash-based CSP for inline error reporting script in index.html
// - 'unsafe-inline' in style-src: Required for dynamic styles in UI components (Tailwind CSS)
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
// SECURITY IMPROVEMENTS (2026-02-19):
// - ✅ Added 'X-Permitted-Cross-Domain-Policies: none' for defense in depth
// - ✅ Restricts Adobe Flash/PDF cross-domain access
//
// SECURITY IMPROVEMENTS (2026-02-25):
// - ✅ Added nonce-based CSP support per request
// - ✅ Updated inline script hash to current version
// - ✅ Added 'Origin-Agent-Cluster: ?1' for process isolation security
// - ✅ Provides additional browser process isolation per origin
// - ⚠️  'unsafe-eval' still required for React runtime in SPA mode
// - ⚠️  'unsafe-inline' still required for style-src (Tailwind CSS in SPA mode)
// NOTE: True nonce-based CSP requires SSR. Current implementation provides nonce for
// future enhancement when SSR is implemented.
//
// SECURITY IMPROVEMENTS (2026-02-26):
// - ✅ Added 'X-DNS-Prefetch-Control: off' to prevent DNS prefetching
// - ✅ Enhances privacy by preventing browsers from pre-resolving domains
// - ✅ Small defense-in-depth security improvement
//
// SECURITY IMPROVEMENTS (2026-02-27):
// - ✅ Added 'Cross-Origin-Embedder-Policy: require-corp' for cross-origin isolation
// - ✅ Works with COOP (already set to 'same-origin') for enhanced security
// - ✅ Enables cross-origin isolation to prevent side-channel attacks
// - ✅ Required for powerful features like SharedArrayBuffer
//
// SECURITY IMPROVEMENTS (2026-02-28):
// - ✅ Added 'upgrade-insecure-requests' to CSP
// - ✅ Automatically upgrades HTTP requests to HTTPS
// - ✅ Works with HSTS for complete transport security
// - ✅ Defense-in-depth security improvement
//
// FUTURE IMPROVEMENTS:

// SECURITY IMPROVEMENTS (2026-02-25):
// - ✅ Added clipboard-read and clipboard-write to Permissions-Policy
// - ✅ Prevents unauthorized clipboard access by embedded content
// - ✅ Added idle-detection to prevent idle detection API usage
// - ✅ Defense-in-depth security improvement

// SECURITY IMPROVEMENTS (2026-02-28):
// - ✅ Added Content-Security-Policy-Report-Only header support
// - ✅ Allows testing CSP rules without enforcing them
// - ✅ Useful for gradually rolling out stricter CSP policies

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  enableCSPReportOnly: false,
  cspDirectives: `default-src 'self'; script-src 'self' ${CSP_INLINE_SCRIPT_HASH} 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report; upgrade-insecure-requests;`,
  cspReportOnlyDirectives: `default-src 'self'; script-src 'self' ${CSP_INLINE_SCRIPT_HASH} 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report; upgrade-insecure-requests;`,
  hstsMaxAge: 31536000,
}

export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const finalConfig = { ...DEFAULT_SECURITY_HEADERS, ...config }

  return async (c: Context, next: Next) => {
    const nonce = generateNonce()
    c.set('csp-nonce', nonce)

    await next()
    const response = c.res

    if (finalConfig.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        `max-age=${finalConfig.hstsMaxAge}; includeSubDomains; preload`
      )
    }

    if (finalConfig.enableCSP) {
      response.headers.set(
        'Content-Security-Policy',
        finalConfig.cspDirectives ?? DEFAULT_SECURITY_HEADERS.cspDirectives!
      )
    }

    if (finalConfig.enableCSPReportOnly) {
      response.headers.set(
        'Content-Security-Policy-Report-Only',
        finalConfig.cspReportOnlyDirectives ?? DEFAULT_SECURITY_HEADERS.cspReportOnlyDirectives!
      )
    }

    if (finalConfig.enableXFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY')
    }

    if (finalConfig.enableXContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    if (finalConfig.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    if (finalConfig.enablePermissionsPolicy) {
      response.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), clipboard-read=(), clipboard-write=(), idle-detection=()'
      )
    }

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Origin-Agent-Cluster', '?1')
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
  }
}

export function getCSPNonce(c: Context): string | undefined {
  return c.get('csp-nonce')
}
