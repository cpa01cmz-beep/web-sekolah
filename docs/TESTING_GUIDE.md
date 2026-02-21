# Testing Guide

This guide provides comprehensive testing patterns, strategies, and best practices for Akademia Pro. All tests follow strict quality standards to ensure system reliability and maintainability.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Organization](#test-organization)
- [Testing Strategies](#testing-strategies)
- [Frontend Testing](#frontend-testing)
  - [Component Testing](#component-testing)
  - [Custom Hook Testing](#custom-hook-testing)
  - [Service Testing](#service-testing)
  - [Integration Testing](#integration-testing)
- [Backend Testing](#backend-testing)
  - [Entity Testing](#entity-testing)
  - [Service Testing](#service-testing-1)
  - [Route Testing](#route-testing)
  - [Middleware Testing](#middleware-testing)
- [Testing Utilities](#testing-utilities)
- [Mocking Strategies](#mocking-strategies)
- [Testing Patterns](#testing-patterns)
- [Common Scenarios](#common-scenarios)
- [Troubleshooting Tests](#troubleshooting-tests)

---

## Testing Philosophy

### Core Principles

1. **AAA Pattern**: All tests follow Arrange-Act-Assert structure
2. **Test Behavior, Not Implementation**: Focus on what code does, not how
3. **One Assertion Per Test**: Keep tests focused and readable
4. **Descriptive Names**: Test names should describe scenario and expectation
5. **Independent Tests**: Each test should run in isolation
6. **Fast Feedback**: Tests should run quickly (unit tests < 100ms preferred)

### Test Pyramid

```
        /\
       /E2E\       (10 tests - Critical paths)
      /------\
     /Integration\  (100 tests - API integration)
    /------------\
   /  Unit Tests  \  (1600+ tests - Logic & behavior)
  /________________\
```

**Distribution**:
- **Unit Tests (70%)**: Fast, focused, test specific functions/components
- **Integration Tests (20%)**: Test module interactions, API endpoints
- **E2E Tests (10%)**: Critical user journeys, happy paths

---

## Test Organization

### Directory Structure

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
├── hooks/
│   ├── useStudent.ts
│   └── __tests__/
│       └── useStudent.test.ts
├── services/
│   ├── studentService.ts
│   └── studentService.test.ts
└── lib/
    ├── api-client.ts
    └── __tests__/
        └── api-client.test.ts

worker/
├── domain/
│   ├── StudentService.ts
│   └── StudentService.test.ts
├── entities.ts
└── __tests__/
    ├── UserEntity.test.ts
    ├── GradeEntity.test.ts
    └── webhook-reliability.test.ts
```

### Naming Conventions

| Type | Pattern | Example |
|------|----------|---------|
| Component | `[ComponentName].test.tsx` | `Button.test.tsx` |
| Hook | `[HookName].test.ts` | `useStudent.test.ts` |
| Service | `[ServiceName].test.ts` | `studentService.test.ts` |
| Entity | `[EntityName].test.ts` | `UserEntity.test.ts` |
| Module | `[ModuleName].test.ts` | `CircuitBreaker.test.ts` |

---

## Testing Strategies

### When to Write Tests

| Scenario | Test Type |
|----------|------------|
| New feature added | Unit tests + Integration tests |
| Bug fixed | Regression test + Unit test |
| Refactoring | Ensure all tests still pass |
| API endpoint added | Route test + Service test |
| Component created | Component test + Snapshot |
| Complex logic added | Unit tests with edge cases |

### Test Coverage Goals

| Layer | Coverage Target | Current Status |
|-------|----------------|----------------|
| Services | 95%+ | 98% |
| Hooks | 90%+ | 95% |
| Components | 85%+ | 88% |
| Entities | 100% | 100% |
| Routes | 100% | 95% |
| Middleware | 100% | 100% |

**Run Coverage**:
```bash
npm run test:coverage
```

---

## Frontend Testing

### Component Testing

**Tools**: Vitest, React Testing Library, userEvent

#### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders in loading state', () => {
    render(<Button isLoading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

#### Component with Props

```typescript
describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    render(<UserCard user={user} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders empty state when user is null', () => {
    render(<UserCard user={null} />)
    expect(screen.getByText('No user data')).toBeInTheDocument()
  })
})
```

#### Component with Mock Children

```typescript
describe('PageHeader', () => {
  it('renders title and actions', () => {
    render(
      <PageHeader title="Dashboard">
        <button>Settings</button>
      </PageHeader>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })
})
```

### Custom Hook Testing

**Tools**: `renderHook` from React Testing Library

#### Basic Hook Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('returns user and logout function', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('logout')
  })

  it('logout clears user', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
  })
})
```

#### Hook with API Call

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('useStudentDashboard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.mock('@/services/studentService', () => ({
      studentService: {
        getDashboard: vi.fn().mockResolvedValue({ grades: [], schedule: [] })
      }
    }))
  })

  it('fetches dashboard data', async () => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useStudentDashboard('student-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})
```

### Service Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { studentService } from './studentService'

describe('studentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches student grades', async () => {
    vi.mock('@/repositories/ApiRepository', () => ({
      apiRepository: {
        get: vi.fn().mockResolvedValue([
          { id: '1', courseId: 'math', score: 95 }
        ])
      }
    }))

    const grades = await studentService.getGrades('student-1')

    expect(grades).toEqual([
      { id: '1', courseId: 'math', score: 95 }
    ])
  })

  it('handles API errors', async () => {
    vi.mock('@/repositories/ApiRepository', () => ({
      apiRepository: {
        get: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    }))

    await expect(studentService.getGrades('student-1'))
      .rejects.toThrow('API Error')
  })
})
```

### Integration Testing

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { StudentDashboardPage } from './StudentDashboardPage'
import { studentService } from '@/services/studentService'

describe('StudentDashboardPage Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.spyOn(studentService, 'getDashboard').mockResolvedValue({
      grades: [{ id: '1', score: 95 }],
      schedule: []
    })
  })

  it('displays dashboard after data loads', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StudentDashboardPage />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('95')).toBeInTheDocument()
    })
  })
})
```

---

## Backend Testing

### Entity Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { UserEntity } from '../entities'

describe('UserEntity', () => {
  let env: Env

  beforeEach(() => {
    env = createTestEnv()
  })

  it('creates user with generated ID', async () => {
    const user = await UserEntity.create(env, {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student'
    })

    expect(user.id).toBeDefined()
    expect(user.id).toMatch(/^user-/)
  })

  it('gets user by email', async () => {
    await UserEntity.create(env, {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student'
    })

    const user = await UserEntity.getByEmail(env, 'john@example.com')

    expect(user).toBeDefined()
    expect(user?.name).toBe('John Doe')
  })

  it('filters out soft-deleted users', async () => {
    const user = await UserEntity.create(env, {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student'
    })

    await UserEntity.delete(env, user.id)

    const allUsers = await UserEntity.list(env)
    const activeUsers = allUsers.items.filter(u => !u.deletedAt)

    expect(activeUsers).toHaveLength(0)
  })
})
```

### Service Testing

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StudentService } from '../domain/StudentService'

describe('StudentService', () => {
  let env: Env

  beforeEach(async () => {
    env = createTestEnv()
    await seedTestData(env)
  })

  it('aggregates dashboard data from multiple sources', async () => {
    const dashboard = await StudentService.getDashboard(env, 'student-1')

    expect(dashboard).toHaveProperty('grades')
    expect(dashboard).toHaveProperty('schedule')
    expect(dashboard).toHaveProperty('announcements')
    expect(dashboard.grades).toBeInstanceOf(Array)
    expect(dashboard.schedule).toBeInstanceOf(Array)
  })

  it('returns empty arrays when no data exists', async () => {
    const dashboard = await StudentService.getDashboard(env, 'nonexistent')

    expect(dashboard.grades).toEqual([])
    expect(dashboard.schedule).toEqual([])
  })
})
```

### Route Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { studentRoutes } from './student-routes'

describe('Student Routes', () => {
  let app: Hono<{ Bindings: Env }>
  let env: Env

  beforeEach(async () => {
    env = createTestEnv()
    app = new Hono()
    studentRoutes(app)
    await seedTestData(env)
  })

  it('GET /api/students/:id/grades returns student grades', async () => {
    const res = await app.request('/api/students/student-1/grades', {
      headers: mockAuthHeaders('student-1', 'student')
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toBeInstanceOf(Array)
  })

  it('rejects unauthorized access', async () => {
    const res = await app.request('/api/students/student-1/grades')

    expect(res.status).toBe(401)
  })

  it('rejects cross-user access', async () => {
    const res = await app.request('/api/students/student-2/grades', {
      headers: mockAuthHeaders('student-1', 'student')
    })

    expect(res.status).toBe(403)
  })
})
```

### Middleware Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { authenticate } from '../middleware/auth'
import { createTestEnv } from '../test-utils'

describe('authenticate middleware', () => {
  let app: Hono<{ Bindings: Env }>
  let env: Env

  beforeEach(() => {
    env = createTestEnv()
    app = new Hono()
    app.use('*', authenticate(env))
    app.get('/protected', (c) => c.json({ success: true }))
  })

  it('allows authenticated requests', async () => {
    const token = generateValidToken(env, 'user-1', 'student')
    const res = await app.request('/protected', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    expect(res.status).toBe(200)
  })

  it('rejects requests without token', async () => {
    const res = await app.request('/protected')

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.code).toBe('UNAUTHORIZED')
  })

  it('rejects invalid tokens', async () => {
    const res = await app.request('/protected', {
      headers: { 'Authorization': 'Bearer invalid-token' }
    })

    expect(res.status).toBe(401)
  })
})
```

---

## Testing Utilities

### Test Environment Setup

```typescript
// worker/__tests__/test-utils.ts
export function createTestEnv(): Env {
  return {
    USER_STORAGE: createMockDurableObject(),
    GRADE_STORAGE: createMockDurableObject(),
    // ... other storage mocks
  }
}

export function createMockDurableObject() {
  const storage = new Map<string, string>()
  return {
    get: (key: string) => storage.get(key),
    put: (key: string, value: string) => storage.set(key, value),
    delete: (key: string) => storage.delete(key),
    list: () => ({ items: Array.from(storage.entries()).map(([id, data]) => ({ id, data })) })
  }
}

export function mockAuthHeaders(userId: string, role: string) {
  const token = generateValidToken(createTestEnv(), userId, role)
  return { 'Authorization': `Bearer ${token}` }
}
```

### Test Data Helpers

```typescript
export async function seedTestData(env: Env) {
  const student = await UserEntity.create(env, {
    name: 'Test Student',
    email: 'student@test.com',
    role: 'student'
  })

  const teacher = await UserEntity.create(env, {
    name: 'Test Teacher',
    email: 'teacher@test.com',
    role: 'teacher'
  })

  return { student, teacher }
}

export function createTestGrade(overrides?: Partial<Grade>) {
  return {
    id: `grade-${Date.now()}`,
    studentId: 'student-1',
    courseId: 'math',
    score: 95,
    feedback: 'Great work',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}
```

### Async Test Helpers

```typescript
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Condition not met within timeout')
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}
```

---

## Mocking Strategies

### Mocking Services

```typescript
import { vi } from 'vitest'
import { studentService } from '@/services/studentService'

vi.mock('@/services/studentService', () => ({
  studentService: {
    getDashboard: vi.fn(),
    getGrades: vi.fn(),
    getSchedule: vi.fn()
  }
}))

// In tests:
studentService.getDashboard.mockResolvedValue(mockData)
```

### Mocking API Repository

```typescript
vi.mock('@/repositories/ApiRepository', () => ({
  apiRepository: {
    get: vi.fn().mockResolvedValue(data),
    post: vi.fn().mockResolvedValue(response),
    put: vi.fn().mockResolvedValue(response),
    delete: vi.fn().mockResolvedValue(undefined)
  }
}))
```

### Mocking React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
}

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

### Mocking Hooks

```typescript
import { renderHook } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

// In tests:
useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() })
```

---

## Testing Patterns

### Testing Loading States

```typescript
it('shows loading state while fetching', () => {
  vi.mocked(studentService.getDashboard).mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve({}), 100))
  )

  render(<StudentDashboardPage />)

  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('shows error message on API failure', async () => {
  vi.mocked(studentService.getDashboard).mockRejectedValue(
    new Error('Network error')
  )

  render(<StudentDashboardPage />)

  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
```

### Testing Empty States

```typescript
it('shows empty state when no grades exist', async () => {
  vi.mocked(studentService.getDashboard).mockResolvedValue({ grades: [], schedule: [] })

  render(<StudentDashboardPage />)

  await waitFor(() => {
    expect(screen.getByText(/no grades yet/i)).toBeInTheDocument()
  })
})
```

### Testing Async Operations

```typescript
it('updates state after async operation', async () => {
  const { result } = renderHook(() => useStudentForm())

  await act(async () => {
    await result.current.submit({ name: 'John', email: 'john@example.com' })
  })

  expect(result.current.isSubmitted).toBe(true)
})
```

### Testing User Interactions

```typescript
it('submits form on button click', async () => {
  const user = userEvent.setup()
  const handleSubmit = vi.fn()

  render(<StudentForm onSubmit={handleSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.type(screen.getByLabelText('Email'), 'john@example.com')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
```

---

## Common Scenarios

### Testing Authentication

```typescript
describe('Protected Route', () => {
  it('redirects unauthenticated users to login', async () => {
    localStorage.removeItem('token')
    render(<ProtectedPage />)

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login')
    })
  })

  it('renders content for authenticated users', async () => {
    localStorage.setItem('token', 'valid-token')
    render(<ProtectedPage />)

    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })
})
```

### Testing Authorization

```typescript
it('admin users can access admin dashboard', async () => {
  render(<AdminDashboard />, {
    wrapper: ({ children }) => (
      <AuthProvider user={{ role: 'admin' }}>
        {children}
      </AuthProvider>
    )
  })

  expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
})

it('non-admin users cannot access admin dashboard', async () => {
  render(<AdminDashboard />, {
    wrapper: ({ children }) => (
      <AuthProvider user={{ role: 'student' }}>
        {children}
      </AuthProvider>
    )
  })

  expect(screen.getByText(/access denied/i)).toBeInTheDocument()
})
```

### Testing Form Validation

```typescript
describe('UserForm', () => {
  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<UserForm />)

    await user.type(screen.getByLabelText('Email'), 'invalid-email')
    await user.tab()

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', async () => {
    const user = userEvent.setup()
    render(<UserForm />)

    await user.type(screen.getByLabelText('Name'), 'Test User')

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })
})
```

### Testing Data Updates

```typescript
describe('Grade Management', () => {
  it('updates grade list after new grade is added', async () => {
    const user = userEvent.setup()
    const newGrade = { score: 95, courseId: 'math' }

    render(<GradeManagementPage />)

    await user.click(screen.getByRole('button', { name: 'Add Grade' }))
    await user.type(screen.getByLabelText('Score'), '95')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText('95')).toBeInTheDocument()
    })
  })
})
```

---

## Troubleshooting Tests

### Common Issues

**Issue**: Tests pass individually but fail when run together

**Solution**: Test isolation issue - ensure tests clean up after themselves:
```typescript
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

**Issue**: "not wrapped in act()" warning

**Solution**: Wrap state updates in act():
```typescript
await act(async () => {
  await result.current.mutate(data)
})
```

**Issue**: Async tests timeout

**Solution**: Increase timeout or use waitFor:
```typescript
it('loads data', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  }, { timeout: 5000 })
})
```

**Issue**: Mock not being called

**Solution**: Ensure mock is called before importing module:
```typescript
vi.mock('./module') // Must be before imports
import { function } from './module'
```

**Issue**: Tests fail in CI but pass locally

**Solution**: Check environment variables and timing:
```bash
# Run with same environment as CI
NODE_ENV=test npm test
```

### Debugging Tips

1. **Use console.log sparingly**: Prefer `screen.debug()` to see DOM
2. **Check test coverage**: `npm run test:coverage` to find untested code
3. **Run specific test**: `npm test -- StudentDashboardPage.test.tsx`
4. **Update snapshots carefully**: Review snapshot changes before committing
5. **Use watch mode**: `npm test -- --watch` for faster iteration

### Performance Tips

1. **Stub expensive operations**: Network calls, file I/O, databases
2. **Use shallow rendering**: For complex component trees
3. **Limit waitFor timeout**: Don't wait longer than necessary
4. **Parallel test execution**: Vitest runs tests in parallel by default
5. **Cache setup operations**: Use beforeEach wisely

---

## Best Practices Summary

### DO ✅

1. **Follow AAA pattern**: Arrange-Act-Assert
2. **Test user behavior**: What user sees/does, not implementation
3. **Use descriptive names**: "should show error when email is invalid"
4. **Mock external dependencies**: API calls, databases, file system
5. **Keep tests independent**: Each test should work alone
6. **Handle loading/error states**: Test all UI states
7. **Use waitFor for async**: Don't use arbitrary delays
8. **Test edge cases**: Null, empty, boundary values
9. **Clean up after tests**: afterEach, vi.clearAllMocks()
10. **Review test coverage**: Aim for 80%+, focus on critical paths

### DON'T ❌

1. **Don't test implementation**: Focus on behavior, not code paths
2. **Don't use arbitrary delays**: setTimeout is flaky, use waitFor
3. **Don't test third-party libraries**: Trust React, Router, etc.
4. **Don't skip tests**: Fix or delete them
5. **Don't ignore warnings**: Investigate and fix them
6. **Don't duplicate test logic**: Use test utilities
7. **Don't test multiple things**: One assertion per test preferred
8. **Don't hardcode test data**: Use factory functions
9. **Don't ignore test isolation**: Tests should not depend on each other
10. **Don't commit failing tests**: Block commits on test failure

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --grep "Button"

# Watch mode
npm test -- --watch

# Run TypeScript check alongside tests
npx tsc --noEmit && npm test
```

### CI/CD Integration

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## Related Documentation

- [Developer Guide](./DEVELOPER_GUIDE.md) - Development setup and architecture
- [API Blueprint](./blueprint.md) - Complete API reference
- [Integration Architecture](./INTEGRATION_ARCHITECTURE.md) - Integration patterns
- [Task List](./task.md) - Implementation status and refactoring tasks

---

**Last Updated**: 2026-02-21

**Status**: ✅ Complete - 3096 tests passing (98% coverage)
