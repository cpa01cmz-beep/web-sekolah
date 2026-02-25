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

## Notes

- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Always run `npm run validate` before committing (typecheck, lint, tests)
