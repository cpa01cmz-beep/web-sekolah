# Contributing to Akademia Pro

Thank you for your interest in contributing to Akademia Pro! This document provides guidelines and instructions for contributing.

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd web-sekolah
npm install

# Start development server
npm run dev

# Run checks before committing
npm run typecheck && npm run lint && npm run test:run
```

## Prerequisites

- Node.js v18 or later
- npm (comes with Node.js)
- Wrangler CLI (for Cloudflare Workers): `npm install -g wrangler`

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow existing code patterns in the codebase
- Use TypeScript strict mode
- No code comments unless explicitly requested
- Write tests for new functionality

### 3. Verify Changes

Before submitting, run all checks:

```bash
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint code quality
npm run test:run   # Unit tests
npm run build      # Production build
```

All checks must pass without errors or warnings.

### 4. Commit Changes

Use conventional commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications

Example:
```
feat: add student grade export functionality
```

### 5. Submit Pull Request

1. Push your branch to GitHub
2. Open a Pull Request against `main`
3. Ensure all CI checks pass
4. Wait for code review

## Project Structure

```
src/           - Frontend React application
  components/  - UI components (shadcn/ui in ui/, custom in forms/, dashboard/, portal/)
  pages/       - Route components
  hooks/       - Custom React hooks
  services/    - API service layer
  stores/      - Zustand state stores
  lib/         - Utilities

worker/        - Backend Hono application
  middleware/  - Auth, validation, rate-limit, security
  domain/      - Business logic services
  storage/     - Durable Objects abstractions
  entities.ts  - Durable Object definitions

shared/        - Shared types between frontend and backend
  types.ts     - TypeScript type definitions

docs/          - Documentation files
```

## Testing

- Vitest is the test framework
- Test files use `.test.ts` suffix
- Tests are co-located with source files in `__tests__/` directories
- Run tests: `npm run test:run`
- Run tests with coverage: `npm run test:coverage`

## Deployment

### Staging (Automatic)

Pushes to `main` branch automatically deploy to staging.

### Production (Manual)

Production deployments require manual approval via GitHub Actions.

### Local Deployment

```bash
npm run deploy:staging   # Deploy to staging
npm run deploy:production # Deploy to production
```

### Health Checks

```bash
npm run health:staging   # Check staging health
npm run health:production # Check production health
```

### Rollback

```bash
npm run rollback:staging   # Rollback staging
npm run rollback:production # Rollback production
```

## Key Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Full development guide
- [API Blueprint](./docs/blueprint.md) - Complete API reference
- [Testing Guide](./docs/TESTING_GUIDE.md) - Testing patterns
- [Security Guide](./docs/SECURITY.md) - Security controls
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions

## Code Style

- TypeScript strict mode enabled
- Follow existing patterns in the codebase
- No code comments unless explicitly requested
- Use conventional commits for PR titles

## Questions?

- Open a GitHub Issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide clear reproduction steps for bugs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
