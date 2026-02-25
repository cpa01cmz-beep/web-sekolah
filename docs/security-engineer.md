# Security Engineer Agent - Long-term Memory

## Overview

This document serves as the long-term memory for the security-engineer agent, tracking patterns, improvements, and lessons learned.

## Agent Patterns

### Phase Workflow

1. INITIATE → Check for existing security-engineer PRs and issues
2. PLAN → Identify small, safe, measurable security improvements
3. IMPLEMENT → Make targeted changes
4. VERIFY → Run typecheck, lint, tests
5. SELF-REVIEW → Evaluate the change
6. SELF EVOLVE → Update memory docs
7. DELIVER → Create PR with security-engineer label

### Improvement Categories

- Security headers (CSP, HSTS, COOP, etc.)
- Authentication/Authorization
- Input validation
- Rate limiting
- Error handling
- Logging security

## Completed Improvements

### 2026-02-28

- **Added logout endpoint with Clear-Site-Data header**
  - Added `/api/auth/logout` endpoint in auth-routes.ts
  - Returns `Clear-Site-Data: "cookies", "storage", "cache"` header on logout
  - Clears browser data when users log out, preventing session fixation attacks
  - Ensures no sensitive data remains in browser after logout
  - Updated frontend AuthService to call the logout API endpoint
  - Small, atomic change with no breaking impact

- **Added upgrade-insecure-requests directive to CSP**
  - Added `upgrade-insecure-requests` to CSP in security-headers.ts
  - Automatically upgrades HTTP requests to HTTPS
  - Works with HSTS for complete transport security
  - Defense-in-depth security improvement
  - Small, atomic change with no breaking impact

### 2026-02-27

- **Added Cross-Origin-Embedder-Policy (COEP) header**
  - Added `Cross-Origin-Embedder-Policy: require-corp` to security-headers.ts
  - Works with COOP (already set to 'same-origin') for cross-origin isolation
  - Enables cross-origin isolation to prevent side-channel attacks (e.g., Spectre)
  - Required for powerful features like SharedArrayBuffer
  - Small, atomic change with no breaking impact

### 2026-02-26

- **Added X-DNS-Prefetch-Control header**
  - Added `X-DNS-Prefetch-Control: off` to security-headers.ts
  - Prevents browsers from pre-resolving DNS for linked domains
  - Enhances privacy by reducing information leakage
  - Small, atomic change with no breaking impact

### 2026-02-25

- **Added Origin-Agent-Cluster header**
  - Added `Origin-Agent-Cluster: ?1` to security-headers.ts
  - Provides additional browser process isolation per origin
  - Small, atomic change with no breaking impact

### 2026-02-23

- **Timing-safe login verification**
  - Prevents user enumeration attacks
  - Uses verifyPasswordTimingSafe() with dummy hash fallback
- **JWT jti claim**
  - Added unique token identification for future revocation

### 2026-02-22

- **Rate limiting IP validation**
  - Improved cf-connecting-ip priority
  - Added store size limits

## Best Practices

- Keep changes small and atomic
- Always run typecheck, lint, and tests
- Document changes in security-headers.ts comments
- Link PRs to issues
- Use conventional commits with security: prefix
