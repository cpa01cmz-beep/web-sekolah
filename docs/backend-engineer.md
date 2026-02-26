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

### 2026-02-25: Enable Skipped Error Monitoring Tests

**Issue**: 2 skipped tests in error-monitoring.test.ts

**Problem**: The integration tests tried to test error catching in Hono routes using `app.use(errorMonitoring())` and throwing errors in route handlers. However, Hono's default error handler catches thrown errors before middleware can intercept them, making these tests impossible to pass.

**Solution**: Converted the broken integration tests to proper unit tests using the mockContext approach that was already working in the file. This follows the existing test patterns in the file.

**Files Changed**:

- `worker/middleware/__tests__/error-monitoring.test.ts` - converted 2 skipped tests to unit tests

### 2026-02-25: Use TimeoutError Class for Consistency

**Problem**: Timeout errors in resilience and scheduled task modules were throwing generic `Error` objects instead of the custom `TimeoutError` class, leading to inconsistent error handling and missing error codes.

**Solution**: Updated three files to use `TimeoutError` instead of generic `Error`:

1. `worker/scheduled.ts` - scheduled task timeout handling
2. `worker/resilience/waitUntil.ts` - background task timeout handling
3. `worker/resilience/Retry.ts` - retry mechanism timeout handling

**Benefits**:

- Consistent error codes (`ErrorCode.TIMEOUT`) across all timeout scenarios
- Better error monitoring and tracking
- Proper error classification for debugging

**Files Changed**:

- `worker/scheduled.ts` - use TimeoutError in withTimeout function
- `worker/resilience/waitUntil.ts` - use TimeoutError in waitUntilWithTimeout
- `worker/resilience/Retry.ts` - use TimeoutError in withRetry timeout handling

### 2026-02-25: DomainError Classes for Consistent Error Handling

**Problem**: Domain services were throwing generic `Error` objects without error codes, causing the error handler to return generic "operation failed" messages to users.

**Solution**: Created typed error classes extending a base `DomainError` that carry error codes:

1. Created `worker/errors/DomainError.ts` with:
   - `DomainError` - base class with error code
   - `NotFoundError` - for NOT_FOUND error code (returns 404)
   - `ValidationError` - for VALIDATION_ERROR code (returns 400)
   - `ConflictError` - for CONFLICT error code (returns 409)

2. Updated domain services to use typed errors:
   - `AnnouncementService` - uses ValidationError, NotFoundError
   - `GradeService` - uses ValidationError, NotFoundError
   - `ParentDashboardService` - uses NotFoundError, ValidationError
   - `StudentDashboardService` - uses NotFoundError
   - `TeacherService` - uses NotFoundError, ValidationError
   - `UserService` - uses NotFoundError

3. Updated `withErrorHandler` in route-utils to:
   - Detect error type and return appropriate HTTP status code
   - Return the actual error message to the user (not generic message)
   - Log appropriately based on error type

**Benefits**:

- Users receive meaningful error messages (e.g., "Announcement not found" instead of "Failed to get announcement")
- Proper HTTP status codes returned (404, 400, 409)
- Consistent error handling across all domain services
- Error codes included in API responses for better debugging

**Files Changed**:

- `worker/errors/DomainError.ts` - new file with error classes
- `worker/errors/index.ts` - exports new error classes
- `worker/domain/AnnouncementService.ts` - uses DomainError
- `worker/domain/GradeService.ts` - uses DomainError
- `worker/domain/ParentDashboardService.ts` - uses DomainError
- `worker/domain/StudentDashboardService.ts` - uses DomainError
- `worker/domain/TeacherService.ts` - uses DomainError
- `worker/domain/UserService.ts` - uses DomainError
- `worker/routes/route-utils.ts` - error handler now handles DomainError

### 2026-02-26: Use ValidationError in Remaining Domain Services

**Problem**: Two domain services were still using generic `Error` instead of `DomainError` classes:

- `TeacherService` - authorization check for class access
- `UserCreationStrategyFactory` - invalid role validation

**Solution**: Updated both files to use `ValidationError` for consistent error handling:

- Returns proper HTTP 400 status code instead of 500
- Provides meaningful error messages to users

**Files Changed**:

- `worker/domain/TeacherService.ts` - use ValidationError for authorization check
- `worker/domain/UserCreationStrategy.ts` - use ValidationError for invalid role
