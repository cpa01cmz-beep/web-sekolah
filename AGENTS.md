# Agent Guidelines

This document provides guidelines for AI agents and developers working on the Akademia Pro repository.

## Verification Commands

Before committing changes, always run these commands to ensure code quality:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Running tests
npm run test:run

# Build (production)
npm run build
```

All commands must pass without errors or warnings before creating a pull request.

## Project Overview

Akademia Pro is a modern school management portal built with:
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: Hono on Cloudflare Workers
- **Storage**: Cloudflare Durable Objects
- **Language**: TypeScript (strict mode)

## Architecture

```
src/                    # Frontend React Application
├── components/         # Reusable UI components
├── pages/             # Page components for routing
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── services/          # Service layer for API abstraction
└── stores/            # Zustand global state stores

worker/                 # Backend Hono Application
├── middleware/         # Expressive middleware (auth, validation, rate-limit)
├── domain/            # Domain services (business logic layer)
├── storage/           # Durable Objects storage abstractions
└── entities.ts        # Durable Object entities (data models)

shared/                 # Shared TypeScript types and interfaces
```

## Code Standards

- TypeScript strict mode enabled
- Zero lint errors required
- All tests must pass
- Follow existing code patterns and conventions
- Use the centralized logger module instead of console methods

## Security

- PBKDF2 password hashing
- JWT authentication
- Rate limiting enabled
- CSP headers configured
- Security score: 98/100

## Test Coverage

- 2610 tests passing
- 114 tests skipped (Cloudflare Workers environment limitations)
- 155 tests todo (pending implementation)

## Pull Request Requirements

- All CI checks must be green
- No merge conflicts
- Branch must be up-to-date with main
- Zero lint errors or warnings
- All tests must pass
- TypeScript compilation successful
