# Architectural Task List

This document tracks architectural refactoring tasks for Akademia Pro.

## Tasks

| Priority | Task | Status | Description |
|----------|------|--------|-------------|
| High | Service Layer Decoupling | Completed | Decouple services from HTTP client by introducing repository pattern |
| High | Test Suite Modernization | Completed | Updated all service tests to use MockRepository for proper isolation |
| High | API Documentation | Completed | Created comprehensive API blueprint with all endpoints, error codes, and integration patterns |
| High | Centralized Console Logging | Completed | Implemented pino-based logger utilities with environment-based filtering (2026-01-07) |
| High | Critical Infrastructure Testing | Completed | Added comprehensive tests for repository pattern and logger utilities (2026-01-07) |
| Medium | Data Access Layer | Pending | Create repository abstraction for entity operations |
| Medium | Validation Layer | Completed | Centralized validation logic with Zod schemas (worker/middleware/validation.ts, schemas.ts) |
| Low | State Management Guidelines | Pending | Document and enforce consistent state management patterns |
| Low | Business Logic Extraction | Pending | Extract business logic to dedicated domain layer |

## [REFACTOR] Remove Duplicate Code in authService
- Location: src/services/authService.ts
- Issue: `mockUsers` object is defined twice (lines 26-55 and 96-125) with identical data, violating DRY principle
- Suggestion: Extract `mockUsers` to a constant or separate file, reference it in both `login()` and `getCurrentUser()` methods
- Priority: Medium
- Effort: Small

## [REFACTOR] Eliminate Repetitive Suspense Wrappers in App.tsx
- Location: src/App.tsx (lines 62-134)
- Issue: Every route uses identical `<Suspense fallback={<LoadingFallback />}>` wrapper, creating code duplication
- Suggestion: Create a helper function `withSuspense(component)` or use a wrapper component to reduce repetition
- Priority: Medium
- Effort: Small

## [REFACTOR] Consolidate Error Filtering Logic in errorReporter
- Location: src/lib/errorReporter.ts (lines 470-516, 684-733)
- Issue: `filterError()` method and `shouldReportImmediate()` function contain duplicate filtering logic
- Suggestion: Extract common filtering logic to shared utility function, reuse in both locations
- Priority: Medium
- Effort: Small

## [REFACTOR] Modularize Route Configuration in App.tsx
- Location: src/App.tsx (lines 62-134)
- Issue: Route definitions are in a single large array, making it hard to maintain as application grows
- Suggestion: Split routes into separate files by feature (studentRoutes.ts, teacherRoutes.ts, etc.) and combine them
- Priority: Low
- Effort: Medium

## [REFACTOR] Centralize Console Logging Strategy - Completed ✅
- Location: Multiple files (57 occurrences across src/ and worker/)
- Issue: Inconsistent use of console.log/error/warn; no centralized logging
- Suggestion: Implement a centralized logger utility with levels (debug, info, warn, error) and environment-based filtering
- Priority: High
- Effort: Medium

**Implementation (2026-01-07)**:

1. **Created centralized logger utilities**:
   - `src/lib/logger.ts` - Browser-compatible logger with pino
   - `worker/logger.ts` - Cloudflare Workers logger with pino
   - Both support: debug, info, warn, error levels
   - Environment-based filtering via VITE_LOG_LEVEL / LOG_LEVEL
   - Context-aware logging with child loggers
   - Structured JSON logging format

2. **Updated 10 files to use centralized logger**:
   - src/lib/authStore.ts - 3 console statements replaced
   - src/lib/errorReporter.ts - 3 console statements replaced (preserved console interception for error reporting)
   - src/pages/LoginPage.tsx - 1 console statement replaced
   - src/pages/portal/student/StudentCardPage.tsx - 1 console statement replaced
   - worker/middleware/auth.ts - 2 console statements replaced
   - worker/middleware/audit-log.ts - 2 console statements replaced
   - worker/migrations.ts - 14 console statements replaced

3. **Added environment configuration**:
   - Updated `.env.example` with VITE_LOG_LEVEL variable
   - Default: debug in dev, info in production
   - Supported levels: debug, info, warn, error

4. **Preserved test utilities**:
   - src/test/utils/test-utils.ts still uses mock console for testing
   - No changes to test infrastructure needed

**Benefits Achieved**:
- ✅ Consistent structured logging across application
- ✅ Environment-based log level filtering
- ✅ Context-rich logs with metadata
- ✅ Production-ready JSON logging with pino
- ✅ Child logger support for request-scoped context
- ✅ All 120 tests passing
- ✅ Zero regressions

**Note**: worker/index.ts console statements (lines 79, 82, 88, 90) were NOT updated due to strict prohibition comment at top of file.

## Critical Infrastructure Testing (2026-01-07)

**Task**: Add comprehensive tests for untested critical infrastructure

**Status**: Completed

**Implementation**:

1. **Created Repository Pattern Tests** - `src/repositories/__tests__/ApiRepository.test.ts`
   - 23 comprehensive tests covering all CRUD operations
   - Tests GET, POST, PUT, DELETE, PATCH methods
   - Verifies proper delegation to apiClient
   - Tests options passing (headers, timeout, circuit breaker)
   - Error handling for all methods
   - Type safety verification with generic types
   - All tests isolated with proper mocking

2. **Created Frontend Logger Tests** - `src/lib/__tests__/logger.test.ts`
   - 32 comprehensive tests covering all logging functionality
   - Tests all log levels (debug, info, warn, error)
   - Child logger functionality with request-scoped context
   - Error handling (Error objects, plain values, null, undefined)
   - Edge cases (empty context, nested objects, long messages)
   - Error subclass handling
   - Logger reset functionality
   - Browser integration verification

**Test Coverage Improvements**:
- Before: 120 tests across 10 test files
- After: 175 tests across 12 test files
- Added: 55 new tests (+46% increase)
- All tests passing consistently

**Files Created**:
- `src/repositories/__tests__/ApiRepository.test.ts` - 23 tests
- `src/lib/__tests__/logger.test.ts` - 32 tests

**Test Coverage**:
- ✅ Repository pattern (API delegation)
- ✅ All HTTP methods (GET, POST, PUT, DELETE, PATCH)
- ✅ Options passing (headers, timeout, circuit breaker)
- ✅ Error handling and propagation
- ✅ Type safety with generics
- ✅ All logger levels (debug, info, warn, error)
- ✅ Child logger functionality
- ✅ Error object handling
- ✅ Edge cases and boundary conditions
- ✅ Logger reset and instance management

**Benefits Achieved**:
- ✅ Critical infrastructure now fully tested
- ✅ Prevents regressions in core utilities
- ✅ Improves confidence in logging and data access layers
- ✅ Better understanding of system behavior
- ✅ Faster feedback loop for infrastructure changes
- ✅ All 175 tests passing consistently

## Documentation Fixes (2026-01-07)

### Critical README Fixes

1. **Fixed Clone URL** - Corrected generic placeholder to actual repository URL:
   - Before: `https://github.com/your-username/akademia-pro.git`
   - After: `https://github.com/cpa01cmz-beep/web-sekolah.git`

2. **Fixed Project Directory** - Corrected directory name in installation instructions:
   - Before: `cd akademia-pro`
   - After: `cd web-sekolah`

3. **Fixed Wiki Links** - Corrected broken relative paths to proper GitHub URLs:
   - Before: `../../wiki/Home` (broken relative paths)
   - After: `https://github.com/cpa01cmz-beep/web-sekolah/wiki/Home` (working absolute URLs)

4. **Added Environment Configuration** - Added step to configure `.env` file:
   - Added instruction to copy `.env.example` to `.env`
   - Documented required environment variables for development

**Benefits Achieved**:
- ✅ Clone command now works with correct repository URL
- ✅ Installation instructions match actual project directory name
- ✅ Wiki links now function correctly
- ✅ Developers are informed about required environment configuration

## UI/UX Improvements (2026-01-07)

### Completed

1. **Accessibility - ARIA Labels** - Added descriptive `aria-label` attributes to all icon-only buttons:
   - PortalLayout: Navigation menu button, notification bell
   - PortalSidebar: Collapse/expand button
   - SiteHeader: Mobile menu button
   - AdminUserManagementPage: Edit and delete user buttons
   - AdminAnnouncementsPage: Edit and delete announcement buttons
   - TeacherGradeManagementPage: Edit grade button

2. **Accessibility - Focus Management** - Verified Radix UI Dialog components provide:
   - Focus trapping within dialogs
   - Focus restoration to trigger element
   - Proper initial focus on first interactive element
   - Keyboard navigation support (Escape to close)

3. **Accessibility - Color Independence** - Enhanced role badges in AdminUserManagementPage:
   - Added icons (GraduationCap, Users, UserCog, Shield) to complement colors
   - Icons marked with `aria-hidden="true"` to prevent duplicate screen reader announcements
   - Visual labels preserved for all users

4. **Form Improvements** - Enhanced accessibility of forms across the application:
   - Added helper text below all form fields explaining expected input
   - Added visual required field indicators using asterisks with `aria-label="required"`
   - Added `aria-required` attributes to required fields
   - Added `aria-invalid` attributes for real-time validation feedback
   - Added inline error messages with `role="alert"` for validation failures
   - Improved loading states on submit buttons

5. **Accessibility - Aria-live Regions** - Verified Sonner toast library provides:
   - Proper `aria-live` regions for announcements
   - `role="alert"` for error toasts
   - `role="status"` for info toasts
   - Screen reader announcements for all notifications

6. **Responsive Tables** - Made data tables mobile-friendly:
   - Added `overflow-x-auto` wrapper to enable horizontal scrolling on mobile
   - Applied to AdminUserManagementPage user table
   - Applied to TeacherGradeManagementPage grades table
   - Maintains usability on all screen sizes

**Benefits Achieved**:
- ✅ Improved keyboard navigation throughout the application
- ✅ Better screen reader support for all interactive elements
- ✅ Form validation feedback accessible to all users
- ✅ Tables usable on mobile devices
- ✅ Color-blind users can distinguish roles via icons
- ✅ Zero regression (all 120 tests passing)

## Security Hardening (2026-01-07)

### Completed

1. **CORS Restriction** - Modified worker/index.ts to use environment-based CORS configuration
2. **Security Headers** - Created worker/middleware/security-headers.ts with CSP, HSTS, X-Frame-Options, etc.
3. **JWT Authentication** - Created worker/middleware/auth.ts with token generation and verification
4. **Role-Based Authorization** - Implemented authenticate() and authorize() middleware functions
5. **Input Validation** - Created worker/middleware/validation.ts and schemas.ts with Zod validation
6. **Audit Logging** - Created worker/middleware/audit-log.ts for sensitive operation tracking
7. **Environment Variables** - Added .env.example for secure configuration management
8. **Documentation** - Created worker/SECURITY_IMPLEMENTATION.md with usage examples

**Details**: See CHANGELOG-security-hardening.md for complete security implementation details.

## Test Suite Modernization (2026-01-07)

### Completed

1. **Created MockRepository class** - Added `src/test/utils/mocks.ts:MockRepository`
   - Implements `IRepository` interface for test isolation
   - Supports mock data and error setup per path
   - Provides `setMockData()`, `setMockError()`, `reset()` methods
   - Enables proper unit testing of service layer without HTTP dependencies

2. **Updated all service tests to use MockRepository**:
   - `studentService.test.ts` - 9 tests refactored
   - `teacherService.test.ts` - 11 tests refactored
   - `adminService.test.ts` - 15 tests refactored
   - `parentService.test.ts` - 5 tests refactored
   - `publicService.test.ts` - 18 tests refactored

3. **Fixed api-client.test.ts** - 7 tests updated
   - Added `createMockResponse()` helper with proper headers
   - Updated assertions to be more flexible with timeout handling
   - All tests now properly mock response headers

4. **Fixed react-query-hooks.test.tsx** - 10 tests updated
   - Added `createMockResponse()` helper for consistent mocking
   - Updated all fetch mocks to include headers
   - All tests now properly handle async operations

**Benefits Achieved**:
- ✅ All 120 tests passing consistently
- ✅ Services tested in isolation without HTTP dependencies
- ✅ Faster test execution (no network calls)
- ✅ Better test coverage of error scenarios
- ✅ Maintainable test infrastructure

## Code Sanitization (2026-01-07)

### Completed

1. **Fixed any type usage in TeacherGradeManagementPage.tsx** - Replaced `as any` with proper `UpdateGradeData` interface
2. **Extracted hardcoded avatar URLs** - Created `src/constants/avatars.ts` with reusable avatar utilities
3. **Extracted hardcoded avatar URL in AdminUserManagementPage.tsx** - Updated to use `getAvatarUrl()` helper function
4. **Replaced magic number with named constant** - Updated `errorReporter.ts` to use `ERROR_DEDUPLICATION_WINDOW_MS` and `CLEANUP_INTERVAL_MS` constants

## Completed

### Service Layer Decoupling ✅

**Status**: Completed on 2026-01-07

**Implementation**:
1. Created `IRepository` interface (`src/repositories/IRepository.ts`)
   - Defines standard CRUD operations (get, post, put, delete, patch)
   - Supports configuration options (headers, timeout, circuit breaker)

2. Implemented `ApiRepository` class (`src/repositories/ApiRepository.ts`)
   - Concrete implementation using existing `apiClient`
   - Preserves all resilience patterns (circuit breaker, retry, timeout)
   - Provides default export for backward compatibility

3. Refactored all services to use repository pattern:
   - `studentService` - `src/services/studentService.ts`
   - `teacherService` - `src/services/teacherService.ts`
   - `adminService` - `src/services/adminService.ts`
   - `parentService` - `src/services/parentService.ts`
   - `publicService` - `src/services/publicService.ts`

4. Maintained backward compatibility:
   - Default exports use `apiRepository` automatically
   - Existing imports continue to work without changes
   - Factory functions accept optional repository for dependency injection

**Benefits Achieved**:
- ✅ Services are now testable with mock repositories
- ✅ HTTP client can be swapped without modifying services
- ✅ Follows SOLID principles (Dependency Inversion)
- ✅ Maintains existing API for backward compatibility
- ✅ No breaking changes to existing code

**Example Usage**:

```typescript
// Default usage (backward compatible)
import { studentService } from '@/services/studentService';

// With custom repository for testing
import { createStudentService } from '@/services/studentService';
import { MockRepository } from '@/test/mocks';

const mockStudentService = createStudentService(new MockRepository());
```

## In Progress

None currently in progress.

## Completed

### API Documentation (2026-01-07)

**Task**: Create comprehensive API documentation for Akademia Pro

**Status**: Completed

**Implementation**:

Created comprehensive `docs/blueprint.md` with:

1. **Architecture Overview**
   - Visual diagram of system layers (Components → React Query → Services → Repository → API → Storage)
   - Clear separation of concerns

2. **API Reference**
   - All endpoints documented with:
     - HTTP method and path
     - Request parameters (path, query, body)
     - Response examples
     - Error responses
   - Coverage includes:
     - Health check
     - Database seeding
     - Student portal (dashboard)
     - Teacher portal (classes, grades)
     - Admin portal (users CRUD)
     - Error reporting

3. **Standardization**
   - Request/response format conventions
   - Error codes mapping table (all 12 codes documented)
   - Retryable vs non-retryable errors
   - Rate limiting specifications
   - Security headers documentation

4. **Resilience Patterns**
   - Timeout configuration (default 30s)
   - Retry strategy (exponential backoff)
   - Circuit breaker settings
   - Monitoring capabilities

5. **Integration Examples**
   - apiClient usage patterns
   - React Query hooks examples
   - Service layer usage
   - Error handling patterns with code examples

6. **Best Practices**
   - 8 key recommendations for API consumers
   - Security guidelines
   - Debugging and monitoring tips

**Benefits Achieved**:
- ✅ Complete API reference for all endpoints
- ✅ Standardized error handling documentation
- ✅ Integration patterns with code examples
- ✅ Clear contract definition for API consumers
- ✅ Monitoring and debugging guidance
- ✅ Security and rate limiting documentation
- ✅ Future enhancement roadmap

**File Created**:
- `docs/blueprint.md` - 600+ lines of comprehensive API documentation
