# Frontend Engineer Agent

## Overview

This document serves as the long-term memory for the frontend-engineer autonomous agent.

## Domain

Frontend engineering - focusing on React, TypeScript, testing, and frontend improvements.

## Working Process

### INITIATE Phase

1. Check for existing PRs with `frontend-engineer` label
2. If PR exists: ensure up to date with main, review, fix if necessary, comment
3. If Issue exists: execute and create/update PR
4. If none: proactive scan limited to domain → create/update PR
5. If nothing valuable: scan repository health/efficiency → create/update PR if needed

### Workflow

1. Check for existing frontend-engineer PR
2. Check for frontend-related issues
3. Proactively scan for frontend improvements
4. Implement small, safe, measurable improvements

### PR Requirements

- Label: `frontend-engineer`
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Key Files Modified

- Test setup: `src/test/setup.ts` - Added matchMedia mock for jsdom environment
- Tests added: `src/pages/__tests__/LoginPage.test.tsx` - 23 tests for LoginPage

## Testing Patterns

- Use `@testing-library/react` for component testing
- Mock dependencies (auth store, router, toast, etc.)
- Test rendering, user interaction, accessibility, and edge cases
- Use vi.fn() for mock functions
- Use waitFor for async assertions

## Common Issues Resolved

- `window.matchMedia is not a function`: Added mock to test setup
- Password validation: Minimum 6 characters (not 8)
- Loading state: Only clicked button is disabled, not all buttons

## Code Conventions

- Follow existing test patterns in codebase
- No comments unless explicitly requested
- Use conventional commits: feat:, fix:, chore:, test:

## Session Results (2026-02-25)

### Completed

- Verified existing PR #1127 is up to date with main and passing checks
- Implemented LoginPage tests (issue #1142)
- Added 23 tests covering:
  - Rendering (6 tests): elements, labels, inputs, buttons, links, helper text
  - Form Validation (5 tests): initial state, missing email/password, invalid email, short password
  - Login Flow (4 tests): successful login, failed login, loading state
  - Accessibility (3 tests): form labels, required attributes, aria-describedby
  - Input Interaction (3 tests): value updates, loading disabled state
  - Navigation (2 tests): home link, logo link
- Added window.matchMedia mock to test setup for jsdom environment
- Created PR #1157 with frontend-engineer label

### Test Results

- All 23 new tests pass
- All 3339+ existing tests pass
- Typecheck passes
- Lint passes with zero warnings
- Build succeeds

### PR

- URL: https://github.com/cpa01cmz-beep/web-sekolah/pull/1157
- Linked to issue: #1142
- Label: frontend-engineer
- Status: MERGEABLE
