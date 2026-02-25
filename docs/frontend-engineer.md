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
