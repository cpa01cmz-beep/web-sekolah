# R&D Agent Memory

## Overview

This document serves as the long-term memory for the Autonomous R&D Specialist agent working on the Akademia Pro school management portal.

## Project Context

- **Project**: Akademia Pro - Modern school management portal
- **Tech Stack**: React 19, Vite 7, TypeScript (strict), Cloudflare Workers, Hono
- **Architecture**: Frontend (React) + Backend (Hono on Cloudflare Workers with Durable Objects)

## Past Work

- Initial scan completed
- No open RnD issues or PRs found
- Codebase is well-maintained with good practices

### Work Item: Issue #1172 - Remove hardcoded example.com URLs

- **Status**: PR #1183 created and linked
- **Solution**: Replaced hardcoded example.com URLs in index.html with empty strings
- **Rationale**: Empty canonical and og:url tags allow search engines/social platforms to use the actual URL
- **Verification**: All checks pass (typecheck, lint, build, 3392 tests)

## Potential Improvements Identified

1. Security.txt has hardcoded example.com URLs - could be made configurable
2. Extensive use of example.com in test data - acceptable for testing
3. Code follows TypeScript strict mode
4. Good error handling patterns in place
5. Proper use of middleware for cross-cutting concerns

## Codebase Health

- Tests: Comprehensive test coverage
- Linting: ESLint configured
- Type checking: TypeScript strict mode
- Formatting: Prettier configured

## Areas of Interest for Future R&D

- Performance optimization for data fetching
- Caching strategies
- Error monitoring improvements
- Security enhancements

## Lessons Learned

- Vite build may fail with EISDIR error if using "/" as href/src in HTML meta tags
- Using empty strings "" for canonical and og:url is a safe alternative that lets crawlers determine the actual URL
