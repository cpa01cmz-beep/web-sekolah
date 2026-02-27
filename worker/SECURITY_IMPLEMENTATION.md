# Security Implementation Guide

This guide demonstrates how to implement security features using the new middleware.

## 1. Authentication Middleware

### Require Authentication

```typescript
import { authenticate } from './middleware/auth'

app.use('/api/protected/*', authenticate())

// This endpoint now requires a valid JWT token
app.get('/api/protected/data', async c => {
  const user = c.get('user') // { id, email, role }
  return c.json({ user })
})
```

### Optional Authentication

```typescript
import { optionalAuthenticate } from './middleware/auth'

app.use('/api/public/*', optionalAuthenticate())

// User data is available if token is provided, otherwise null
app.get('/api/public/data', async c => {
  const user = c.get('user') // User object or undefined
  return c.json({ user })
})
```

## 2. Authorization Middleware

### Role-Based Access Control

```typescript
import { authorize } from './middleware/auth'

// Only admins can access this
app.post('/api/admin/users', authenticate(), authorize('admin'), async c => {
  // Admin only code
})

// Teachers and admins can access this
app.get('/api/teacher/classes', authenticate(), authorize('teacher', 'admin'), async c => {
  // Teacher or admin code
})

// All authenticated users can access this
app.get(
  '/api/protected/data',
  authenticate(),
  authorize('student', 'teacher', 'parent', 'admin'),
  async c => {
    // Any authenticated user
  }
)
```

## 3. Input Validation Middleware

### Validate Request Body

```typescript
import { validateBody } from './middleware/validation'
import { createUserSchema } from './middleware/schemas'

app.post('/api/users', validateBody(createUserSchema), async c => {
  const validatedData = c.get('validatedBody')
  // Data is already validated and typed
  return c.json(validatedData)
})
```

### Validate Query Parameters

```typescript
import { validateQuery } from './middleware/validation'
import { queryParamsSchema } from './middleware/schemas'

app.get('/api/users', validateQuery(queryParamsSchema), async c => {
  const validatedQuery = c.get('validatedQuery')
  // { page?: number, limit?: number, ... }
  return c.json(validatedQuery)
})
```

### Validate Path Parameters

```typescript
import { validateParams } from './middleware/validation'
import { paramsSchema } from './middleware/schemas'

app.get('/api/users/:id', validateParams(paramsSchema), async c => {
  const validatedParams = c.get('validatedParams')
  // { id: string (UUID) }
  return c.json(validatedParams)
})
```

## 4. Audit Logging

### Add Audit Logging to Endpoints

```typescript
import { auditLog } from './middleware/audit-log'

app.post('/api/users', authenticate(), auditLog('CREATE_USER'), async c => {
  // Creates a user and logs the action
})

// Audit logs include:
// - Timestamp
// - Request ID
// - Action name
// - User ID (if authenticated)
// - User role
// - IP address
// - User agent
// - Path and method
// - Status code
// - Success/failure
```

## 5. Complete Secure Endpoint Example

```typescript
import { Hono } from 'hono'
import { authenticate, authorize } from './middleware/auth'
import { validateBody, validateParams } from './middleware/validation'
import { auditLog } from './middleware/audit-log'
import { createUserSchema, updateGradeSchema, paramsSchema } from './middleware/schemas'
import { ok, bad, notFound } from './core-utils'

const app = new Hono()

// Create a new user (admin only, with validation and audit log)
app.post(
  '/api/users',
  authenticate(),
  authorize('admin'),
  validateBody(createUserSchema),
  auditLog('CREATE_USER'),
  async c => {
    const userData = c.get('validatedBody')
    const user = c.get('user')

    // userData is already validated and typed
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    // ... create user in database ...

    return ok(c, newUser)
  }
)

// Update a grade (teacher/admin, with validation and audit log)
app.put(
  '/api/grades/:id',
  authenticate(),
  authorize('teacher', 'admin'),
  validateParams(paramsSchema),
  validateBody(updateGradeSchema.partial()),
  auditLog('UPDATE_GRADE'),
  async c => {
    const gradeId = c.req.param('id')
    const gradeData = c.get('validatedBody')
    const user = c.get('user')

    // Additional authorization check: ensure user can update this specific grade
    // if (user.role === 'teacher') {
    //   // Verify teacher owns this grade
    // }

    // ... update grade in database ...

    return ok(c, { id: gradeId, ...gradeData })
  }
)

// Get student dashboard (student/admin, with audit log)
app.get(
  '/api/students/:id/dashboard',
  authenticate(),
  authorize('student', 'admin'),
  validateParams(paramsSchema),
  auditLog('GET_STUDENT_DASHBOARD'),
  async c => {
    const studentId = c.req.param('id')
    const user = c.get('user')

    // Ensure student can only access their own dashboard
    if (user.role === 'student' && user.id !== studentId) {
      return bad(c, 'Access denied')
    }

    // ... fetch dashboard data ...

    return ok(c, {
      /* dashboard data */
    })
  }
)
```

## 6. Security Headers

Security headers are automatically applied to all `/api/*` routes:

- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- X-XSS-Protection

## 7. CORS Configuration

CORS is configured via the `ALLOWED_ORIGINS` environment variable:

```bash
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

## Environment Variables Required

Create a `.env` file (based on `.env.example`):

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-chars
```

## Token Generation

To generate a JWT token:

```typescript
import { generateToken } from './middleware/auth'

const token = await generateToken(
  {
    sub: 'user-id',
    email: 'user@example.com',
    role: 'teacher',
  },
  process.env.JWT_SECRET,
  '1h' // expiration
)
```

## Testing Authenticated Endpoints

```bash
# Login to get token (you'll need to implement login endpoint)
TOKEN="your-jwt-token-here"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/protected/data
```

## Best Practices

1. **Always validate input**: Use `validateBody`, `validateQuery`, or `validateParams` for all user input
2. **Use role-based authorization**: Implement granular access control with `authorize()`
3. **Audit sensitive operations**: Use `auditLog()` for all critical operations
4. **Validate ownership**: For user-specific resources, verify the user owns the resource
5. **Sanitize output**: Use the provided `sanitizeHtml` and `sanitizeString` functions when needed
6. **Never trust the client**: Always re-validate on the server side
7. **Use environment variables**: Never hardcode secrets or configuration
