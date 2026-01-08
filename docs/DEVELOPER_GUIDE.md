# Developer Guide

This guide helps developers contribute to Akademia Pro. For API documentation, see [API Blueprint](./blueprint.md).

## Table of Contents

- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Creating Components](#creating-components)
- [Adding Features](#adding-features)
- [Testing Guidelines](#testing-guidelines)
- [Code Standards](#code-standards)
- [Common Tasks](#common-tasks)

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (recommended: v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/cpa01cmz-beep/web-sekolah.git
cd web-sekolah

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Commands

```bash
# Development
npm run dev              # Start dev server (frontend + worker)
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare

# Testing
npm test                # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run with coverage
npm run test:ui         # Run tests with UI

# Quality
npx tsc --noEmit      # Check TypeScript types
npm run lint           # Run ESLint
```

---

## Architecture Overview

### Layered Architecture

The application follows a clean, layered architecture:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  <- React Components (pages, ui)
├─────────────────────────────────────┤
│         Custom Hooks Layer         │  <- useStudent, useTeacher, etc.
├─────────────────────────────────────┤
│         Service Layer              │  <- studentService, teacherService, etc.
├─────────────────────────────────────┤
│         Repository Layer           │  <- ApiRepository (data access)
├─────────────────────────────────────┤
│         API Client Layer           │  <- apiClient (React Query + resilience)
└─────────────────────────────────────┘
```

**Purpose of Each Layer:**

- **Presentation Layer**: React components handle UI rendering and user interactions. No business logic.
- **Custom Hooks Layer**: Domain-specific hooks encapsulate data fetching logic with React Query.
- **Service Layer**: Business logic and API interaction abstraction following service contracts.
- **Repository Layer**: Clean abstraction over API client for testability.
- **API Client Layer**: Generic API client with error handling, caching, and resilience patterns.

### Directory Structure

```
src/
├── components/         # Reusable UI components (shadcn/ui based)
├── config/            # Configuration files (navigation, etc.)
├── constants/         # Shared constants (grades, avatars)
├── hooks/            # Custom React hooks (domain-specific data fetching)
├── lib/              # Utility functions (api-client, logger, authStore)
├── pages/            # Page components for routing
├── repositories/      # Data access layer (repository pattern)
├── services/         # Service layer (business logic)
├── test/             # Test utilities
└── utils/           # Helper functions

worker/
├── middleware/       # Authentication, validation, rate limiting
├── domain/          # Domain services (business logic)
├── entities.ts      # Durable Object entities (data models)
├── auth-routes.ts   # Authentication endpoints
├── webhook-routes.ts # Webhook endpoints
└── index.ts         # Worker entry point

shared/
└── types.ts         # Shared TypeScript types
```

---

## Creating Components

### UI Components (src/components/)

**When to Create:**
- Reusable across multiple pages
- Pure UI without business logic
- Follows shadcn/ui patterns

**Pattern:**

```typescript
// src/components/ui/my-component.tsx
import { cn } from '@/lib/utils'

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  )
}
```

**Best Practices:**
- Use `cn()` for className merging
- Accept `className` prop for flexibility
- Keep components small and focused
- Use TypeScript interfaces for props

### Page Components (src/pages/)

**When to Create:**
- Route-specific pages
- Domain-specific UI
- Uses custom hooks for data

**Pattern:**

```typescript
// src/pages/portal/student/StudentDashboardPage.tsx
import { useStudentDashboard } from '@/hooks/useStudent'
import { useAuth } from '@/hooks/useAuth'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useStudentDashboard(user?.id || '')

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      {/* Render dashboard data */}
    </div>
  )
}
```

**Best Practices:**
- Use domain-specific hooks (never call `useQuery` directly)
- Handle loading, error, and empty states
- Keep presentation logic, not business logic
- Use React Query's built-in states

### Layout Components

**Pattern:**

```typescript
// src/components/PortalLayout.tsx
import { Outlet } from 'react-router-dom'
import { PortalSidebar } from './PortalSidebar'

export function PortalLayout() {
  return (
    <div className="flex h-screen">
      <PortalSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## Adding Features

### Step 1: Define Service Interface

```typescript
// src/services/studentService.ts
export interface StudentService {
  getDashboard(studentId: string): Promise<StudentDashboardData>
  getSchedule(studentId: string): Promise<ScheduleItem[]>
  // ...
}
```

### Step 2: Implement Service

```typescript
// src/repositories/ApiRepository.ts
export class ApiRepository implements IRepository {
  constructor(private apiClient: ApiClient) {}

  async get<T>(path: string): Promise<T> {
    return this.apiClient.request<T>('GET', path)
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.apiClient.request<T>('POST', path, body)
  }
}

// src/services/studentService.ts
export const studentService: StudentService = {
  async getDashboard(studentId: string): Promise<StudentDashboardData> {
    return repository.get<StudentDashboardData>(
      `/api/students/${studentId}/dashboard`
    )
  }
}
```

### Step 3: Create Custom Hook

```typescript
// src/hooks/useStudent.ts
import { useTanstackQuery } from '@/lib/api-client'
import { CachingTime } from '@/lib/api-client/constants'

export function useStudentDashboard(studentId: string) {
  return useTanstackQuery({
    queryKey: ['student-dashboard', studentId],
    queryFn: () => studentService.getDashboard(studentId),
    enabled: !!studentId,
    staleTime: CachingTime.FIVE_MINUTES,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
  })
}
```

### Step 4: Use Hook in Component

```typescript
// src/pages/portal/student/StudentDashboardPage.tsx
export function StudentDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useStudentDashboard(user?.id || '')

  // Component logic...
}
```

### Backend (Worker)

**Add API Route:**

```typescript
// worker/student-routes.ts
app.get('/api/students/:id/dashboard', authenticate(), authorize('student'), async (c) => {
  const studentId = c.req.param('id')
  const dashboard = await StudentService.getDashboard(c.env, studentId)
  return c.json({ success: true, data: dashboard })
})
```

**Add Domain Service:**

```typescript
// worker/domain/StudentService.ts
export async function getDashboard(env: Env, studentId: string): Promise<StudentDashboardData> {
  const [schedule, grades, announcements] = await Promise.all([
    ScheduleEntity.getByStudentId(env, studentId),
    GradeEntity.getByStudentId(env, studentId),
    AnnouncementEntity.getRecent(env, 10)
  ])

  return { schedule, grades, announcements }
}
```

---

## Testing Guidelines

### Frontend Tests

**Test File Location:** Same as component file, with `.test.tsx` suffix

**Pattern:**

```typescript
// src/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Backend Tests

**Test File Location:** `worker/__tests__/` directory

**Pattern:**

```typescript
// worker/__tests__/StudentService.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { StudentService } from '../domain/StudentService'

describe('StudentService', () => {
  let env: Env

  beforeEach(() => {
    env = createTestEnv()
  })

  it('gets dashboard data', async () => {
    const dashboard = await StudentService.getDashboard(env, 'student-1')
    expect(dashboard).toBeDefined()
    expect(dashboard.schedule).toHaveLength(5)
  })
})
```

### Test Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Test user behavior**, not implementation details
- **Mock external dependencies** (API, storage)
- **Test edge cases**: empty states, errors, null values
- **Keep tests isolated**: each test should be independent

---

## Code Standards

### TypeScript

- Use interfaces for object shapes
- Use types for unions and primitives
- Enable strict mode in `tsconfig.json`
- Avoid `any` - use `unknown` if needed

### Naming Conventions

- **Components**: PascalCase (`StudentDashboardPage`)
- **Hooks**: camelCase with `use` prefix (`useStudentDashboard`)
- **Services**: camelCase (`studentService`)
- **Functions**: camelCase (`getDashboard`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Files**: camelCase for utilities, PascalCase for components

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use arrow functions for callbacks
- Keep functions under 50 lines when possible
- Extract complex logic to separate functions

### Imports

```typescript
// 1. React and core libraries
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

// 2. Third-party libraries
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// 3. Internal modules
import { useStudent } from '@/hooks/useStudent'
import { studentService } from '@/services/studentService'
import { cn } from '@/lib/utils'
```

---

## Common Tasks

### Adding a New Route

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link if needed
4. Test route works

### Creating a New User Role

1. Add role to shared types: `shared/types.ts`
2. Update authentication middleware
3. Create role-specific pages
4. Add role-specific API endpoints
5. Update documentation

### Adding a New API Endpoint

1. Define route in `worker/index.ts`
2. Add authentication/authorization middleware
3. Implement in domain service
4. Add entity methods if needed
5. Update API blueprint

### Adding Webhook Event

1. Define event type in `worker/webhook-service.ts`
2. Trigger webhook in relevant service
3. Update API documentation
4. Test webhook delivery

---

## Debugging

### Frontend Debugging

```typescript
// Enable debug logging
const VITE_LOG_LEVEL = 'debug'

// Check network requests
// Browser DevTools → Network tab

// View React state
// React DevTools extension
```

### Backend Debugging

```typescript
// Enable debug logging
LOG_LEVEL=debug npm run dev

// Check worker logs
wrangler tail

// Test endpoint directly
curl http://localhost:3000/api/health
```

---

## Getting Help

### Documentation

- [API Blueprint](./blueprint.md) - Complete API reference
- [README](../README.md) - Project overview
- [Quick Start](./QUICK_START.md) - User guides

### Common Issues

**Tests failing?**
- Run `npm install` to update dependencies
- Check TypeScript compilation: `npx tsc --noEmit`

**Build failing?**
- Check for linting errors: `npm run lint`
- Verify TypeScript types: `npx tsc --noEmit`

**API requests failing?**
- Check worker is running
- Verify environment variables in `.env`
- Check browser console for CORS errors

---

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and write tests
3. Run tests: `npm run test:run`
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m 'Add feature'`
6. Push and create pull request

**Pull Request Checklist:**
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No linting errors
- [ ] Typescript compilation successful
- [ ] Documentation updated
- [ ] Code follows style guidelines
