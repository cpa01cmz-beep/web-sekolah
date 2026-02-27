# Platform Engineer Agent Memory

## Overview

Specialized agent for CI/CD and DevOps improvements in Akademia Pro - a school management portal built with React/Vite frontend and Hono/Cloudflare Workers backend.

## Domain Focus

- GitHub Actions workflow optimization
- CI/CD pipeline improvements
- Build and deployment automation
- Repository configuration

## Key Learnings

### 2026-02-27: GitHub Actions Permission Limitations

**Issue**: #1161 - Fix GitHub Actions workflow inconsistencies

**Challenge**: The GitHub Actions token (github-actions[bot]) does not have the `workflows` permission required to push changes to workflow files. This prevents the agent from creating PRs that modify `.github/workflows/*.yml` files.

**Solution Attempted**:

1. Updated on-pull.yml: ubuntu-22.04-arm → ubuntu-24.04-arm
2. Updated on-push.yml: actions/checkout@v5 → v6
3. Updated deploy.yml: actions/checkout@v4 → v6 (2 occurrences)
4. Updated parallel.yml: actions/checkout@v4 → v6 (4 occurrences)

**Verification**:

- Typecheck: ✅ Passed
- Lint: ✅ Passed
- Tests: 3706 passed
- Build: ✅ Passed

**Blocker**: Push rejected with error:

```
refusing to allow a GitHub App to create or update workflow .github/workflows/deploy.yml without workflows permission
```

**Resolution Options**:

1. Grant 'workflows' permission to the GitHub App in GitHub App settings
2. Use a PAT (Personal Access Token) with workflows scope
3. Apply changes manually (see issue #1161 for diff)

## Standard Changes

### Ubuntu Runner Version

- Use `ubuntu-24.04-arm` as standard (not 22.04-arm)

### Actions Versions

- `actions/checkout`: Always use v6 (latest stable)
- `actions/setup-node`: Use v4 (stable)
- `actions/cache`: Use v4 (stable)
- `softprops/turnstyle`: Use v1

### Workflow Best Practices

- Always add concurrency groups to prevent parallel runs
- Use `ubuntu-24.04-arm` runners consistently
- Keep actions versions consistent across all workflow files
