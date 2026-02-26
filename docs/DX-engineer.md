# DX-engineer Agent Documentation

## Overview

DX-engineer focuses on improving Developer Experience through small, safe, measurable improvements.

## Workflow

1. **INITIATE** - Check for existing DX-engineer PRs, issues, or scan for improvements
2. **PLAN** - Plan the improvements
3. **IMPLEMENT** - Implement them
4. **VERIFY** - Verify the changes (typecheck, lint, tests, build)
5. **SELF-REVIEW** - Review the process
6. **SELF EVOLVE** - Check other agents' memory and evolve
7. **DELIVER** - Create PR with DX-engineer label

## PR Requirements

- Label: DX-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Common DX Improvements

- Code organization and structure
- Import path improvements
- Documentation improvements
- Build and test configuration
- Developer tooling
- Security vulnerability fixes via `npm audit`

## Past Improvements

- **2026-02-26**: Fixed rollup high severity vulnerability (Arbitrary File Write via Path Traversal)
  - PR: https://github.com/cpa01cmz-beep/web-sekolah/pull/1227
- **2026-02-25**: Fixed 3 security vulnerabilities (ajv, hono, minimatch) via npm audit fix
  - PR: https://github.com/cpa01cmz-beep/web-sekolah/pull/1224
- **2026-02-25**: Attempted to fix 349 files with Prettier formatting issues, but reverted due to size (not atomic)

## Notes

- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Always run `npm run validate` before committing (typecheck, lint, tests)
