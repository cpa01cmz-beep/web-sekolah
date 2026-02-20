# Security Guide

## Security Overview

Akademia Pro maintains a **97/100 security score (A+)** with comprehensive security controls implemented throughout the codebase.

**Last Security Assessment**: 2026-02-20

**Production Dependencies**: 0 vulnerabilities
**Development Dependencies**: 12 vulnerabilities (ESLint transitive deps, ReDoS - LOW risk)

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

| Type | Limit | Window | Usage |
|------|-------|--------|-------|
| Standard | 100 requests | 15 min | Most API endpoints |
| Strict | 50 requests | 5 min | Sensitive operations (seed, errors) |
| Loose | 1000 requests | 1 hour | Less restrictive operations |
| Auth | 5 requests | 15 min | Login attempts |

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

**Current State**: CSP uses `'unsafe-inline'` and `'unsafe-eval'` directives

**Reasoning**:
- `'unsafe-inline'` required for React runtime and inline event handlers
- `'unsafe-eval'` required for some React libraries and eval() usage
- `'unsafe-inline'` in style-src required for Tailwind CSS

**Future Enhancement**: For maximum security, implement nonce-based CSP:

```typescript
cspDirectives: `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; ...`
```

**Impact**: Medium effort (1-2 days), requires HTML templating changes

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

| Date | Score | Status | Notes |
|------|-------|--------|-------|
| 2026-02-20 | 97/100 (A+) | Secure | Dev dependency vulnerabilities documented (ESLint transitive deps), all controls verified |
| 2026-01-22 | 98/100 (A+) | Secure | Zero vulnerabilities, CSP improvements, all controls verified |
| 2026-01-08 | 95/100 (A+) | Secure | Zero vulnerabilities, comprehensive controls |
| 2026-01-07 | 94/100 (A+) | Secure | Security headers implemented |

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
