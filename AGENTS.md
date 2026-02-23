# AI Agent Guide

This file provides guidance for AI assistants working with this codebase.

## Project Overview

Akademia Pro - A modern school management portal built with:

- **Frontend**: React 19, Vite 7, React Router 7, Tailwind CSS 4, shadcn/ui, Zustand, React Query
- **Backend**: Hono on Cloudflare Workers with Durable Objects
- **Language**: TypeScript (strict mode)

## Essential Commands

```bash
# Install dependencies
npm install

# Development server (frontend + backend worker)
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Run tests (watch mode)
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Pre-commit Requirements

Before committing changes, always run:

```bash
npm run validate
```

This runs typecheck, lint, and tests. All three must pass without errors.

Alternatively, run individually:

```bash
npm run typecheck && npm run lint && npm run test:run
```

## Project Structure

- `src/` - Frontend React application
  - `components/` - UI components (shadcn/ui in `ui/`, custom in `forms/`, `dashboard/`, `portal/`)
  - `pages/` - Route components (`portal/student/`, `portal/teacher/`, `portal/parent/`, `portal/admin/`)
  - `hooks/` - Custom React hooks for data fetching
  - `services/` - API service layer
  - `stores/` - Zustand state stores
  - `lib/` - Utilities (api-client, logger, storage)

- `worker/` - Backend Hono application
  - `middleware/` - Auth, validation, rate-limit, security
  - `domain/` - Business logic services
  - `storage/` - Durable Objects abstractions
  - `entities.ts` - Durable Object definitions

- `shared/` - Shared types between frontend and backend
  - `types.ts` - TypeScript type definitions

- `docs/` - Documentation files

## Code Conventions

- Use TypeScript strict mode
- Follow existing patterns in the codebase
- No code comments unless explicitly requested
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`

## Testing

- Vitest is the test framework
- Test files use `.test.ts` suffix
- Tests are co-located with source files in `__tests__/` directories
- All 3339 tests should pass

## Architecture Patterns

- **Frontend**: React Query for server state, Zustand for global state, local state for UI
- **Backend**: Routes → Domain Services → Entities → Storage (layered architecture)
- **Data**: Durable Objects with primary and secondary indexes for O(1) lookups

## Key Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Full development guide
- [API Blueprint](./docs/blueprint.md) - Complete API reference
- [Testing Guide](./docs/TESTING_GUIDE.md) - Testing patterns
- [Security Guide](./docs/SECURITY.md) - Security controls
