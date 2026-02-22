# Security Guidelines

## Security Overview

Akademia Pro maintains a **98/100 security score (A+)** with comprehensive security controls implemented throughout the codebase.

**Last Security Assessment**: 2026-02-22

---

## Authentication and Authorization

### Current Implementation

The application uses industry-standard authentication with the following security measures:

### JWT Implementation
- **Algorithm**: HMAC-SHA256 (HS256) for token signing
- **Secret Management**: Environment variable (`JWT_SECRET`) - never hardcoded
- **Token Expiration**: Configurable (default: 1 hour)
- **Secure Token Generation**: Web Crypto API for cryptographic operations

```typescript
// Token verification (worker/middleware/auth.ts)
const payload = await verifyToken(token, secret);
```

### Password Security
- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Algorithm**: SHA-256
- **Iterations**: 100,000 (OWASP recommendation)
- **Salt**: 16 bytes (128 bits) random salt per password
- **Output**: 32 bytes (256 bits) hash
- **Password Policy**: Minimum 8 characters with uppercase, lowercase, and number requirements

```typescript
// Password hashing (worker/password-utils.ts)
const hash = await hashPassword(password);
```

### Role-Based Access Control (RBAC)
- **Roles**: student, teacher, parent, admin
- **Middleware Enforcement**: `authenticate()` and `authorize()` middleware
- **Principle of Least Privilege**: Each role has minimal required permissions

```typescript
// Authorization middleware (worker/middleware/auth.ts)
app.post('/api/admin/users',
  authenticate(),
  authorize('admin'),
  handler
);
```

---

## Data Protection

### Data Encryption
- **Passwords**: PBKDF2 with 100,000 iterations and per-password salt
- **Transport**: TLS 1.3 enforced by Cloudflare
- **Tokens**: JWT signed with HMAC-SHA256

### Input Validation
- **Framework**: Zod schema validation for all inputs
- **Coverage**: Request body, query parameters, path parameters
- **Type Safety**: Validated types throughout the application

```typescript
// Input validation (worker/middleware/validation.ts)
app.post('/api/users',
  validateBody(createUserSchema),
  handler
);
```

### API Security
- **Rate Limiting**: Multi-tier rate limiting (STRICT, STANDARD, LOOSE, AUTH)
- **Security Headers**: Comprehensive headers on all API responses
- **CORS**: Environment-based allowed origins configuration
- **Error Handling**: No sensitive information exposed in errors

---

## Security Headers

All `/api/*` responses include comprehensive security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-...' 'unsafe-eval'; ...
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

---

## Rate Limiting

Multiple rate limiters with configurable windows and limits:

| Type | Limit | Window | Usage |
|------|-------|--------|-------|
| Standard | 100 requests | 15 min | Most API endpoints |
| Strict | 50 requests | 5 min | Sensitive operations |
| Loose | 1000 requests | 1 hour | Less restrictive operations |
| Auth | 5 requests | 15 min | Login attempts |

**Implementation**: `worker/middleware/rate-limit.ts`

---

## Infrastructure Security

### Cloudflare Security
- TLS 1.3 for all traffic
- DDoS protection (built-in)
- Edge network with global distribution

### Worker Security
- Minimal dependencies to reduce attack surface
- Regular dependency audits (`npm audit`)
- Proper error handling with no sensitive data leakage
- Structured logging without secrets

---

## Monitoring and Auditing

### Audit Logging
- Request ID tracking for audit trails
- Structured logging with context
- Sensitive data excluded from logs

```typescript
// Audit logging (worker/middleware/audit-log.ts)
app.post('/api/users',
  auditLog('CREATE_USER'),
  handler
);
```

### CSP Violation Monitoring
- `/api/csp-report` endpoint for CSP violation reports
- Structured logging for monitoring

---

## Compliance

### OWASP Top 10 (2021) Coverage

| Risk | Coverage |
|------|----------|
| A01: Broken Access Control | RBAC with role-based authorization |
| A02: Cryptographic Failures | PBKDF2, SHA-256, HS256 JWT |
| A03: Injection | Zod input validation |
| A04: Insecure Design | Secure defaults, defense in depth |
| A05: Security Misconfiguration | Security headers, CSP, rate limiting |
| A06: Vulnerable Components | Regular audits, 0 known CVEs |
| A07: Authentication Failures | Strong password hashing, JWT, rate limiting |
| A08: Software/Data Integrity Failures | Webhook HMAC verification |
| A09: Security Logging Failures | Structured logging, CSP monitoring |
| A10: Server-Side Request Forgery | External service validation, timeouts |

---

## Best Practices

### Development
1. **Never hardcode secrets** - Use environment variables
2. **Validate all input** - Use Zod schemas
3. **Use secure defaults** - DENY X-Frame-Options, restrictive permissions
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Write secure tests** - Cover authentication/authorization logic

### Production
1. **Set `ENVIRONMENT=production`**
2. **Generate strong `JWT_SECRET`** (minimum 32 characters)
3. **Configure `ALLOWED_ORIGINS`** for production domains
4. **Enable logging** at appropriate level
5. **Monitor security** - Track failed logins, rate limit violations

---

## Environment Variables

**Required for Production**:
```bash
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=<strong-random-minimum-32-chars>
```

**Never Commit**:
- API keys
- JWT secrets
- Passwords
- Tokens
- Any production credentials

---

## Additional Resources

- **Security Documentation**: `docs/SECURITY.md`
- **Security Assessment**: `docs/SECURITY_ASSESSMENT_2026-01-22.md`
- **Implementation Guide**: `worker/SECURITY_IMPLEMENTATION.md`
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## Contact & Reporting

**Security Issues**: Report security vulnerabilities through responsible disclosure

**Policy**: Follow responsible disclosure guidelines - report issues privately before public disclosure
