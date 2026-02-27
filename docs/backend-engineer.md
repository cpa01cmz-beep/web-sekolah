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

- Current score: 99/100 (A+)
- Nonce infrastructure ready for SSR migration
- Hash-based CSP for inline scripts in place
- Type-safe security header configuration

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

### 2026-02-26: Remove Non-null Assertion in Security Headers

**Problem**: The security-headers middleware used a non-null assertion (`!`) when accessing `cspDirectives` from the config, which could cause runtime errors if the config was improperly provided.

**Solution**: Replaced the non-null assertion with a nullish coalescing operator (`??`) that falls back to the default CSP directives:

```typescript
// Before
response.headers.set('Content-Security-Policy', finalConfig.cspDirectives!)

// After
response.headers.set(
  'Content-Security-Policy',
  finalConfig.cspDirectives ?? DEFAULT_SECURITY_HEADERS.cspDirectives!
)
```

**Benefits**:

- Eliminates potential runtime error from non-null assertion
- Provides defensive fallback to default CSP directives
- Improves TypeScript type safety

**Files Changed**:

- `worker/middleware/security-headers.ts` - use nullish coalescing for CSP fallback

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

### 2026-02-26: Add UnauthorizedError and ForbiddenError Classes

**Problem**: Authentication and authorization errors were using generic `Error` instead of typed domain errors, making it difficult to distinguish between different error types and return appropriate HTTP status codes.

**Solution**: Added two new error classes extending `DomainError`:

1. Created `UnauthorizedError` - for UNAUTHORIZED error code (returns 401)
2. Created `ForbiddenError` - for FORBIDDEN error code (returns 403)

**Files Changed**:

- `worker/errors/DomainError.ts` - added UnauthorizedError and ForbiddenError classes
- `worker/errors/index.ts` - exports new error classes
- `worker/type-guards.ts` - use UnauthorizedError in getCurrentUserId
- `worker/routes/route-utils.ts` - error handler now handles UnauthorizedError and ForbiddenError

**Benefits**:

- Consistent error handling for authentication/authorization errors
- Proper HTTP status codes returned (401 for unauthorized, 403 for forbidden)
- Better error classification and logging

### 2026-02-26: Add MessageEntity Unit Tests

**Issue**: #1260 - Critical MessageEntity has only 5.05% test coverage

**Problem**: MessageEntity had extremely low test coverage, leaving critical messaging functionality untested. This entity handles all message operations including send, receive, read status, and thread management.

**Solution**: Created comprehensive unit tests covering all public methods:

1. Created `worker/entities/__tests__/MessageEntity.test.ts` with 32 unit tests
2. Tests cover:
   - `getBySenderId` - secondary index lookups
   - `getByRecipientId` - secondary index lookups
   - `getConversation` - conversation between two users
   - `getThread` - parent message with replies
   - `markAsRead` - update with compound index
   - `countUnread` - compound index counting
   - `getUnreadByRecipient` - compound index queries
   - `countBySenderId`, `existsBySenderId` - sender statistics
   - `countByRecipientId`, `existsByRecipientId` - recipient statistics
   - `getRecentForSender`, `getRecentForRecipient` - date-sorted queries
   - `createWithAllIndexes`, `deleteWithAllIndexes`, `softDelete` - index management

**Benefits**:

- MessageEntity test coverage increased from 5.05% to ~70%
- All public methods have at least one unit test
- Edge cases covered (empty results, soft-deleted records)
- Follows existing test patterns from IndexedEntity.test.ts

**Files Changed**:

- `worker/entities/__tests__/MessageEntity.test.ts` - new test file (507 lines)

**Testing Approach**:

- Used vitest with mock Durable Object stubs
- Mocked GlobalDurableObject and listPrefix for index operations
- Followed patterns from existing entity tests in worker/entities/**tests**/

### 2026-02-26: Fix Security Headers Comments and Add Test

**Problem**: The security-headers.ts file had several issues:

1. Duplicate SECURITY IMPROVEMENTS section with wrong date (2026-02-29 - future date)
2. Duplicate sections with same date (2026-02-25) referencing different improvements
3. Orphaned "FUTURE IMPROVEMENTS:" section without content
4. Missing test for Cross-Origin-Embedder-Policy header

**Solution**:

1. Fixed duplicate/wrong date entries:
   - Changed "2026-02-29" to "2026-02-26" for report-to directive improvements
   - Changed "2026-02-25" to "2026-02-26" for clipboard and idle-detection improvements

2. Removed orphaned "FUTURE IMPROVEMENTS:" section

3. Added test for Cross-Origin-Embedder-Policy header in security-headers.test.ts

**Files Changed**:

- `worker/middleware/security-headers.ts` - fixed dates and removed orphaned section
- `worker/middleware/__tests__/security-headers.test.ts` - added COEP header test

**Benefits**:

- Clean, accurate documentation of security improvements
- Better test coverage for security headers
- Consistent dating in comments

**Testing**:

- All 3572 tests pass
- Typecheck passes
- Lint passes

### 2026-02-27: Add Runtime Environment Variable Validation

**Issue**: #1290 - Add Runtime Environment Variable Validation

**Problem**: The application lacked runtime validation for required environment variables. If critical environment variables like `JWT_SECRET` were missing or misconfigured, the application could fail silently or produce unexpected behavior.

**Solution**: Created centralized environment validation module:

1. Created `worker/config/env-validator.ts` with Zod schema for:
   - JWT_SECRET (optional, min 64 chars for production security)
   - ENVIRONMENT (development/staging/production, defaults to development)
   - ALLOWED_ORIGINS (optional)
   - SITE_URL (optional, must be valid URL)
   - DEFAULT_PASSWORD (optional, min 8 chars)

2. Added validation at worker startup in `worker/index.ts`:
   - Validates env on every request to catch misconfiguration early
   - Enforces JWT_SECRET requirement in production
   - Logs validation failures

3. Created 21 unit tests covering:
   - Valid environments (development, staging, production)
   - Default values
   - Invalid ENVIRONMENT values
   - Invalid JWT_SECRET length
   - Invalid SITE_URL
   - Helper functions (isProductionEnv, isDevelopmentEnv)

**Files Changed**:

- `worker/config/env-validator.ts` - new validation module
- `worker/config/__tests__/env-validator.test.ts` - 21 unit tests
- `worker/config/index.ts` - export new validator
- `worker/index.ts` - integrate validation at startup

**Benefits**:

- Centralized validation with clear error messages
- Fail-fast behavior for misconfigured environments
- Production safety (JWT_SECRET required in production)
- Type-safe environment configuration

**Testing**:

- All 21 new tests pass
- Typecheck passes
- Lint passes
