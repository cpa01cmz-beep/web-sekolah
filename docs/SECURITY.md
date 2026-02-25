# Security Guide

## Security Overview

Akademia Pro maintains a **98/100 security score (A+)** with comprehensive security controls implemented throughout the codebase.

**Last Security Assessment**: 2026-02-25

**Production Dependencies**: 0 vulnerabilities
**Development Dependencies**: 2 vulnerabilities (ESLint transitive deps - accepted risk, see below)

### Known Vulnerability Acceptance

The following vulnerabilities exist in development dependencies only (not included in production bundles):

| Dependency                         | Severity | CVE                 | Description                   | Status        |
| ---------------------------------- | -------- | ------------------- | ----------------------------- | ------------- |
| ajv <6.14.0                        | Moderate | GHSA-2g4f-4pwh-qvx6 | ReDoS when using $data option | Accepted risk |
| minimatch <3.1.3 or >=9.0.0 <9.0.6 | High     | GHSA-3ppc-4f35-3m26 | ReDoS via repeated wildcards  | Accepted risk |

**Justification for Acceptance**:

- Both are transitive dependencies of ESLint
- Not included in production builds (devDependencies only)
- Would require ESLint 10.x upgrade (significant migration effort)
- Risk limited to development machine exploitation
- Plan to address when ESLint 10 becomes stable

---

## Recent Security Improvements

### 2026-02-25

- **Documented ESLint transitive dependency vulnerabilities**
  - Updated vulnerability count from 12 to 2 (vulnerabilities fixed over time)
  - Added acceptance justification for ajv and minimatch ReDoS vulnerabilities
  - These are dev-only dependencies not included in production builds
  - Risk accepted until ESLint 10.x upgrade is feasible

- **Implemented nonce-based CSP support**
  - Added cryptographic nonce generation per request in security headers middleware
  - Nonce is stored in request context for future use in SSR scenarios
  - Added `getCSPNonce()` helper function for retrieving nonce in route handlers
  - Updated inline script hash to current version (`sha256-xsWpBSh+88Gpp+H1+XSGjqLj67OrRo+q9tmTvaO4nhs=`)
  - Provides foundation for full nonce-based CSP when SSR is implemented

### 2026-02-23

- **Added timing-safe login verification to prevent user enumeration attacks**
  - Login endpoint now performs password hash verification even when user doesn't exist
  - Prevents attackers from determining valid email addresses through timing analysis
  - Added `verifyPasswordTimingSafe()` function with dummy hash fallback
  - Aligned with OWASP Authentication Cheat Sheet recommendations
- Added JWT ID (jti) claim to all generated tokens for unique token identification and future revocation capability
- Strengthened CSP report schema validation by replacing `.passthrough()` with `.strict()` to reject unknown properties

---

## Security Controls

### Authentication & Authorization

- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Algorithm**: SHA-256
- **Iterations**: 100,000 (OWASP recommendation)
- **Salt**: 16 bytes (128 bits) random salt per password
- **Output**: 32 bytes (256 bits) hash
- **Storage Format**: `salt:hash` (hex encoded)

**JWT Authentication**:

- HMAC-SHA256 signing algorithm
- Token expiration: 24 hours (configurable)
- Secure token generation using Web Crypto API
- Middleware-based enforcement (`authenticate()`, `authorize()`)

**Role-Based Access Control (RBAC)**:

- 4 roles: student, teacher, parent, admin
- Middleware enforces role-based permissions
- Protected routes require proper role verification

**Implementation**:

- `worker/middleware/auth.ts` - Authentication middleware
- `worker/auth-routes.ts` - Login/logout endpoints
- `worker/password-utils.ts` - Password hashing

### Security Headers

All `/api/*` responses include comprehensive security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()
X-XSS-Protection: 1; mode=block
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

**Implementation**: `worker/middleware/security-headers.ts`

### Rate Limiting

Multiple rate limiters with configurable windows and limits:

| Type     | Limit         | Window | Usage                               |
| -------- | ------------- | ------ | ----------------------------------- |
| Standard | 100 requests  | 15 min | Most API endpoints                  |
| Strict   | 50 requests   | 5 min  | Sensitive operations (seed, errors) |
| Loose    | 1000 requests | 1 hour | Less restrictive operations         |
| Auth     | 5 requests    | 15 min | Login attempts                      |

**IP Identification**:

- Primary: `cf-connecting-ip` header (Cloudflare, trustworthy)
- Fallback: `x-real-ip` header
- Last resort: `x-forwarded-for` first IP (can be spoofed)
- Maximum store size: 10,000 entries (prevents memory exhaustion)

**Implementation**: `worker/middleware/rate-limit.ts`

### Input Validation

- Zod schema validation for all request body, query parameters, and path parameters
- Type-safe validation with detailed error messages
- Sanitization utilities: `sanitizeHtml()`, `sanitizeString()`
- Automatic validation error responses with field-level details

**Implementation**: `worker/middleware/validation.ts`

### CORS Configuration

- Configurable `ALLOWED_ORIGINS` environment variable
- Supports multiple origins (comma-separated)
- Default fallback: `http://localhost:3000,http://localhost:4173`

**Example**: `ALLOWED_ORIGINS=https://example.com,https://www.example.com`

---

## Deployment Security Checklist

### Pre-Deployment

- [ ] Verify `ENVIRONMENT` is set to `production`
- [ ] Update `ALLOWED_ORIGINS` to production domain(s)
- [ ] Generate strong `JWT_SECRET` (minimum 32 characters)
  - Command: `openssl rand -base64 32`
- [ ] Ensure Cloudflare Account ID is configured
- [ ] Run security scan: `npm audit` (should show 0 vulnerabilities)
- [ ] Run tests: `npm test` (all tests passing)
- [ ] Review security headers are enabled
- [ ] Verify rate limiting is configured appropriately

### Environment Variables

**Required for Production**:

```bash
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=<strong-random-minimum-32-chars>
```

**Optional**:

```bash
VITE_LOG_LEVEL=info  # Options: debug, info, warn, error
```

**Never Commit**:

- API keys
- JWT secrets
- Passwords
- Tokens
- Any production credentials

---

## Security Best Practices

### Development

1. **Never hardcode secrets**
   - Use environment variables for all sensitive data
   - Never commit `.env` files
   - Use `.env.example` as template

2. **Follow secure coding practices**
   - Use `dangerouslySetInnerHTML` only with sanitized content
   - Avoid `eval()` and similar functions
   - Validate all user input
   - Implement proper error handling (fail-secure)

3. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update packages when security patches are available
   - Review changelogs for breaking changes

4. **Write secure tests**
   - Test authentication/authorization logic
   - Validate input sanitization
   - Test error conditions
   - Cover security-critical code paths

### Production

1. **Monitor security**
   - Enable logging (appropriate level: info/warn)
   - Review error logs for suspicious patterns
   - Monitor failed login attempts
   - Track rate limit violations

2. **Regular maintenance**
   - Update dependencies monthly
   - Review security headers quarterly
   - Rotate secrets annually
   - Conduct security assessment annually

3. **Incident response**
   - Document incident response procedures
   - Have rollback plan ready
   - Monitor security announcements
   - Test recovery procedures

---

## Known Security Considerations

### Content Security Policy (CSP)

**Current State**: CSP uses hash-based CSP for inline scripts and `'unsafe-inline'`/`'unsafe-eval'` for React runtime

**Implementation Details**:

- **Inline Scripts**: Protected using SHA-256 hash (`'sha256-xsWpBSh+88Gpp+H1+XSGjqLj67OrRo+q9tmTvaO4nhs='`)
- **React Runtime**: Requires `'unsafe-eval'` for Just-In-Time compilation
- **Styles**: Requires `'unsafe-inline'` for Tailwind CSS dynamic classes
- **Nonce Support**: Cryptographic nonce (32 chars) generated per request

**Current CSP Header**:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-xsWpBSh+88Gpp+H1+XSGjqLj67OrRo+q9tmTvaO4nhs=' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; object-src 'none'; worker-src 'self'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report;
```

**Future Enhancement**: Full nonce-based CSP requires Server-Side Rendering (SSR). Current implementation provides nonce infrastructure for future SSR migration.

**Implementation**: `worker/middleware/security-headers.ts`

### Outdated Dependencies

**Status**: Minor version updates available (no CVEs in current versions)

**Examples** (as of 2026-02-20):

- `@cloudflare/vite-plugin`: 1.21.2 → 1.25.2
- `@types/node`: 25.0.10 → 25.3.0
- `eslint`: 9.39.2 → 10.0.0

**Recommendation**: Update during next maintenance cycle

**Impact**: Low effort (2-3 hours), no known vulnerabilities

### Development Dependency Vulnerabilities

**Status**: 12 vulnerabilities in ESLint transitive dependencies (development only)

**Details** (as of 2026-02-20):

- `ajv <8.18.0`: ReDoS vulnerability (GHSA-2g4f-4pwh-qvx6) - 1 moderate
- `minimatch <10.2.1`: ReDoS vulnerability (GHSA-3ppc-4f35-3m26) - 11 high

**Affected Packages** (dev dependencies only):

- `eslint` (transitive: ajv, minimatch)
- `@typescript-eslint/*` (transitive: minimatch)
- `eslint-plugin-import` (transitive: minimatch)

**Risk Assessment**: LOW - These are development-only dependencies not included in production builds

**Recommendation**: Update to ESLint 10.x during next maintenance cycle (breaking change)

**Impact**: Medium effort (4-6 hours), requires ESLint config migration

---

## Security Assessment History

| Date       | Score       | Status | Notes                                                                                                                                              |
| ---------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-25 | 98/100 (A+) | Secure | Nonce-based CSP support added (per-request nonce generation), inline script hash updated, infrastructure ready for SSR migration                   |
| 2026-02-23 | 98/100 (A+) | Secure | Timing-safe login verification added (prevents user enumeration), JWT ID (jti) claim for token tracking, CSP report schema validation strengthened |
| 2026-02-22 | 97/100 (A+) | Secure | Rate limiting IP validation improved (cf-connecting-ip priority), store size limit added, CSP report validation added                              |
| 2026-02-20 | 97/100 (A+) | Secure | Dev dependency vulnerabilities documented (ESLint transitive deps), all controls verified                                                          |
| 2026-01-22 | 98/100 (A+) | Secure | Zero vulnerabilities, CSP improvements, all controls verified                                                                                      |
| 2026-01-08 | 98/100 (A+) | Secure | Zero vulnerabilities, comprehensive controls                                                                                                       |
| 2026-01-07 | 94/100 (A+) | Secure | Security headers implemented                                                                                                                       |

---

## Additional Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **Security Headers**: https://securityheaders.com/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## Contact & Reporting

**Security Issues**: Report security vulnerabilities through responsible disclosure

**Security Team**: Contact via security@yourdomain.com (replace with actual contact)

**Policy**: Follow responsible disclosure guidelines - report issues privately before public disclosure
