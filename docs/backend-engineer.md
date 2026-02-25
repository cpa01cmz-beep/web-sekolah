# Backend Engineer Agent Memory

## Overview

Specialized agent for backend security improvements in Akademia Pro - a school management portal built with Hono on Cloudflare Workers.

## Domain Focus

- Backend security (CSP, authentication, authorization)
- Worker middleware improvements
- API security headers
- Rate limiting

## Key Learnings

### 2026-02-25: Nonce-based CSP Implementation

**Issue**: #1144 - security: Implement nonce-based Content Security Policy

**Challenge**: This is a SPA (Single Page Application) served via Cloudflare Workers + Vite. True nonce-based CSP requires SSR (Server-Side Rendering) to inject unique nonces into HTML.

**Solution Implemented**:

1. Added cryptographic nonce generation per request using `crypto.getRandomValues()`
2. Stored nonce in Hono request context (`c.set('csp-nonce', nonce)`)
3. Exported `getCSPNonce()` helper for route handlers
4. Updated inline script hash to current version
5. Added tests to verify unique nonce per request

**Architecture Notes**:

- Security headers applied to `/api/*` routes only
- Frontend static assets served via `@cloudflare/vite-plugin`
- True nonce-based CSP for frontend requires SSR migration
- Current implementation provides infrastructure for future SSR

**Files Changed**:

- `worker/middleware/security-headers.ts` - nonce generation + hash update
- `worker/middleware/__tests__/security-headers.test.ts` - tests
- `docs/SECURITY.md` - documentation

## Testing Approach

- Use `npm test -- --run` for test execution
- Use `npm run typecheck` for TypeScript validation
- Use `npm run lint` for ESLint validation

## Common Commands

```bash
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
npm test -- --run  # Run tests
npm run build      # Production build
```

## Security Assessment

- Current score: 98/100 (A+)
- Nonce infrastructure ready for SSR migration
- Hash-based CSP for inline scripts in place
