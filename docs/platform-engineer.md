# Platform Engineer Agent Memory

## Overview

Specialized agent for CI/CD and DevOps improvements in Akademia Pro - a school management portal built with React/Vite frontend and Hono/Cloudflare Workers backend.

## Domain Focus

- GitHub Actions workflow optimization
- CI/CD pipeline improvements
- Build and deployment automation
- Repository configuration

## Key Learnings

### 2026-02-27: GitHub Actions Workflow Inconsistencies - FIXED

**Issue**: #1161 - Fix GitHub Actions workflow inconsistencies

**Changes Applied**:

1. ✅ on-pull.yml: ubuntu-22.04-arm → ubuntu-24.04-arm
2. ✅ on-push.yml: actions/checkout@v5 → v6
3. ✅ deploy.yml: actions/checkout@v4 → v6 (2 occurrences)
4. ✅ parallel.yml: actions/checkout@v4 → v6 (4 occurrences)

**Verification**:

- Typecheck: ✅ Passed
- Lint: ✅ Passed
- Tests: ✅ Passed
- Build: ✅ Passed

**Status**: RESOLVED

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
