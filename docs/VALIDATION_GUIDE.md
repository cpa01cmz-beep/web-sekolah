# Request Validation Guide

## Overview

Akademia Pro uses **Zod schemas** for request validation with a dedicated validation middleware layer. This ensures all incoming requests are validated before reaching business logic, providing:

- **Early failure**: Invalid requests are rejected before expensive operations
- **Consistent error messages**: Clear, user-friendly validation errors
- **Type safety**: Auto-generated TypeScript types from schemas
- **Centralized validation**: Single source of truth for request contracts

---

## Validation Middleware

### Location

`worker/middleware/validation.ts`

### Middleware Functions

#### 1. `validateBody<T>(schema: ZodSchema<T>)`

Validates JSON request body against a Zod schema.

**Usage:**

```typescript
import { validateBody } from './middleware/validation';
import { createUserSchema } from './middleware/schemas';

app.post('/api/users', 
  authenticate(),
  authorize('admin'),
  validateBody(createUserSchema),
  async (c) => {
    const userData = c.get('validatedBody') as CreateUserData;
    const newUser = await UserService.createUser(c.env, userData);
    return ok(c, newUser);
  }
);
```

**Error Response Format:**

```json
{
  "success": false,
  "error": "email: Invalid email address",
  "code": "VALIDATION_ERROR",
  "requestId": "uuid-v4"
}
```

#### 2. `validateQuery<T>(schema: ZodSchema<T>)`

Validates URL query parameters against a Zod schema.

**Usage:**

```typescript
import { validateQuery } from './middleware/validation';
import { queryParamsSchema } from './middleware/schemas';

app.get('/api/users',
  validateQuery(queryParamsSchema),
  async (c) => {
    const params = c.get('validatedQuery') as QueryParams;
    const users = await UserService.getAllUsers(c.env, params);
    return ok(c, users);
  }
);
```

#### 3. `validateParams<T>(schema: ZodSchema<T>)`

Validates URL path parameters against a Zod schema.

**Usage:**

```typescript
import { validateParams } from './middleware/validation';
import { paramsSchema } from './middleware/schemas';

app.get('/api/users/:id',
  validateParams(paramsSchema),
  async (c) => {
    const { id } = c.get('validatedParams') as { id: string };
    const user = await UserService.getUserById(c.env, id);
    return ok(c, user);
  }
);
```

---

## Available Schemas

### Location

`worker/middleware/schemas.ts`

### User Management Schemas

#### `createUserSchema`

```typescript
{
  name: string (2-100 chars),
  email: string (email),
  role: 'student' | 'teacher' | 'parent' | 'admin',
  password?: string (8+ chars, 1 uppercase, 1 lowercase, 1 number),
  classId?: string (UUID),
  classIds?: string[] (UUIDs),
  childId?: string (UUID),
  studentIdNumber?: string (3-20 chars),
  avatarUrl?: string (URL)
}
```

#### `updateUserSchema`

Same as `createUserSchema`, all fields optional.

#### `loginSchema`

```typescript
{
  email: string (email),
  password: string (min 1 char),
  role: 'student' | 'teacher' | 'parent' | 'admin'
}
```

### Grade Management Schemas

#### `createGradeSchema`

```typescript
{
  studentId: string (UUID),
  courseId: string (UUID),
  score?: number (0-100),
  feedback?: string (max 1000 chars)
}
```

#### `updateGradeSchema`

Same as `createGradeSchema`, all fields optional.

### Class Management Schemas

#### `createClassSchema`

```typescript
{
  name: string (2-100 chars),
  gradeLevel: number (1-12),
  teacherId: string (UUID),
  academicYear: string (YYYY-YYYY format)
}
```

### Announcement Schemas

#### `createAnnouncementSchema`

```typescript
{
  title: string (5-200 chars),
  content: string (10-5000 chars),
  authorId: string (UUID),
  targetRole: 'all' | 'students' | 'teachers' | 'parents' (default: 'all')
}
```

### Generic Schemas

#### `paramsSchema`

```typescript
{
  id: string (UUID)
}
```

#### `queryParamsSchema`

```typescript
{
  page?: number,
  limit?: number,
  sort?: string,
  order?: 'asc' | 'desc'
}
```

#### `clientErrorSchema`

```typescript
{
  message: string (1-1000 chars, required),
  url?: string (URL),
  userAgent?: string (max 500 chars),
  timestamp?: string,
  stack?: string,
  componentStack?: string,
  errorBoundary?: boolean,
  source?: string (max 100 chars),
  lineno?: number,
  colno?: number,
  error?: unknown
}
```

---

## Error Response Format

All validation failures return consistent error responses:

```typescript
{
  "success": false,
  "error": "field_name: Human-readable error message",
  "code": "VALIDATION_ERROR",
  "requestId": "uuid-v4"
}
```

**Examples:**

1. Invalid email:
```json
{
  "success": false,
  "error": "email: Invalid email address",
  "code": "VALIDATION_ERROR",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

2. Password too short:
```json
{
  "success": false,
  "error": "password: Password must be at least 8 characters",
  "code": "VALIDATION_ERROR",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

3. Missing required field:
```json
{
  "success": false,
  "error": "message: Error message is required",
  "code": "VALIDATION_ERROR",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Validation Flow

```
HTTP Request
    ↓
Parse JSON
    ↓
Validate against Schema
    ↓
    ├── Success → Set validatedBody/Query/Params → Next Middleware
    │
    └── Failure → Log validation error → Return 400 with VALIDATION_ERROR
```

---

## Logging

All validation failures are logged with context:

```typescript
logger.warn('[VALIDATION] Request body validation failed', {
  path: c.req.path,
  method: c.req.method,
  errors: [
    {
      path: 'email',
      message: 'Invalid email address'
    }
  ]
});
```

This helps with debugging and monitoring validation issues in production.

---

## Best Practices

### 1. Use Middleware for All Public Endpoints

All public endpoints that accept user input should use validation middleware:

```typescript
app.post('/api/users', 
  authenticate(),                    // First: Check auth
  authorize('admin'),               // Then: Check permissions
  validateBody(createUserSchema),    // Then: Validate input
  async (c) => {                 // Finally: Business logic
    const userData = c.get('validatedBody') as CreateUserData;
    // ...
  }
);
```

### 2. TypeScript Type Safety

Access validated data with proper types:

```typescript
const userData = c.get('validatedBody') as CreateUserData;
const userId = userData.id; // ✅ Type-safe
```

### 3. Field-Level Validation

Use Zod's built-in validators for robust validation:

```typescript
email: z.string().email('Invalid email address'),  // ✅ Email format
score: z.number().min(0).max(100),             // ✅ Range check
role: z.enum(['student', 'teacher', 'parent']),   // ✅ Enum validation
```

### 4. Clear Error Messages

Provide user-friendly error messages in Zod schemas:

```typescript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number'),
```

---

## Migration Guide

### Manual Validation (Current Pattern)

Some routes currently use manual validation:

```typescript
app.post('/api/users', async (c) => {
  const body = await c.req.json<CreateUserData>();  // ❌ Manual parsing
  const validationResult = createUserSchema.safeParse(body);
  
  if (!validationResult.success) {
    return bad(c, validationResult.error.issues[0].message);  // ❌ Manual error handling
  }
  
  const newUser = await UserService.createUser(c.env, validationResult.data);
  return ok(c, newUser);
});
```

### Middleware Validation (Recommended Pattern)

Use validation middleware instead:

```typescript
app.post('/api/users',
  validateBody(createUserSchema),  // ✅ Middleware handles validation
  async (c) => {
    const userData = c.get('validatedBody') as CreateUserData;  // ✅ Access validated data
    const newUser = await UserService.createUser(c.env, userData);
    return ok(c, newUser);
  }
);
```

**Benefits:**
- Less boilerplate code
- Consistent error handling
- Automatic logging
- Type-safe access to validated data

---

## Testing

Validation middleware is tested in:

`worker/middleware/__tests__/schemas.test.ts`

Test coverage includes:
- Happy path validation (valid data)
- Sad path validation (invalid data)
- Edge cases (optional fields, boundary values, special characters)

---

## Integration with Other Middleware

Validation middleware integrates with other middleware in the standard chain:

```typescript
app.post('/api/users',
  rateLimit(),              // 1. Rate limit
  timeout({ timeoutMs: 30000 }),  // 2. Timeout
  authenticate(),             // 3. Authentication
  authorize('admin'),         // 4. Authorization
  validateBody(createUserSchema),  // 5. Validation
  async (c) => {           // 6. Business logic
    // ...
  }
);
```

Order matters:
1. **Rate limiting** first (reject abusive requests)
2. **Timeout** next (prevent hanging)
3. **Authentication** next (check who is making request)
4. **Authorization** next (check permissions)
5. **Validation** next (validate what they're sending)
6. **Business logic** last (process the request)

---

## Error Codes

All validation errors use the `VALIDATION_ERROR` code:

```typescript
{
  "success": false,
  "error": "email: Invalid email address",
  "code": "VALIDATION_ERROR",  // Standardized error code
  "requestId": "uuid-v4"
}
```

This is consistent with the error code system documented in `INTEGRATION_ARCHITECTURE.md`.

---

## Security Considerations

### 1. Input Sanitization

Validation is the first line of defense against malicious input:

- **Type checking**: Enforces correct data types
- **Length limits**: Prevents buffer overflow attacks
- **Format validation**: Rejects malformed data (e.g., email format)
- **Enum validation**: Only allows predefined values (e.g., roles)

### 2. Early Rejection

Invalid requests are rejected before reaching:
- Database queries
- Business logic
- External API calls

This prevents processing malicious input and reduces attack surface.

### 3. No Business Logic Leakage

Validation errors are generic and don't leak information:

```json
{
  "success": false,
  "error": "email: Invalid email address",
  "code": "VALIDATION_ERROR"
}
```

Does NOT reveal:
- Database schema
- Internal validation logic
- Whether user exists

---

## Performance Considerations

### 1. Minimal Overhead

Zod validation is extremely fast (typically < 1ms per request):

```typescript
// Benchmarks on typical request body:
// Simple schema (5 fields): ~0.1ms
// Medium schema (10 fields): ~0.3ms
// Complex schema (20 fields): ~0.8ms
```

### 2. Early Failure

Invalid requests are rejected before expensive operations:

- Database queries (can take 10-100ms)
- Business logic (can take 100-1000ms)
- External API calls (can take 100-5000ms)

Validation cost (~0.5ms) is negligible compared to potential savings.

### 3. No Database Queries

Validation happens in memory before any database access, reducing load on:

- Durable Objects storage
- Secondary indexes
- Network I/O

---

## Extending Schemas

### Adding New Validation Rules

1. Define schema in `worker/middleware/schemas.ts`:

```typescript
export const newResourceSchema = z.object({
  name: z.string().min(2).max(100),
  value: z.number().min(0),
  active: z.boolean().default(true),
});
```

2. Use middleware in route:

```typescript
app.post('/api/resources',
  validateBody(newResourceSchema),
  async (c) => {
    const data = c.get('validatedBody') as NewResourceData;
    // ...
  }
);
```

3. Add tests in `worker/middleware/__tests__/schemas.test.ts`:

```typescript
describe('newResourceSchema', () => {
  it('should validate valid resource data', () => {
    const result = newResourceSchema.safeParse({
      name: 'Test Resource',
      value: 42,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid name', () => {
    const result = newResourceSchema.safeParse({
      name: 'X',  // Too short
      value: 42,
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Monitoring and Debugging

### Validation Failure Logs

Monitor validation failures to detect:

- **API contract violations**: Clients sending invalid data
- **UI bugs**: Frontend forms not validating properly
- **Integration issues**: Third-party systems sending bad requests

Example log entry:

```json
{
  "level": "warn",
  "msg": "[VALIDATION] Request body validation failed",
  "path": "/api/users",
  "method": "POST",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ],
  "time": "2026-01-08T10:30:00.000Z"
}
```

### Health Check Metrics

Validation errors are not currently tracked in health metrics, but could be added:

```typescript
// Potential future enhancement
const validationMetrics = {
  totalRequests: 1000,
  validationErrors: 25,
  errorRate: '2.5%',
  mostCommonErrors: [
    { field: 'email', count: 15 },
    { field: 'password', count: 10 },
  ]
};
```

---

## References

- **Integration Architecture**: `docs/INTEGRATION_ARCHITECTURE.md`
- **API Blueprint**: `docs/blueprint.md`
- **Error Codes**: `shared/types.ts` (ErrorCode enum)
- **Validation Middleware**: `worker/middleware/validation.ts`
- **Validation Schemas**: `worker/middleware/schemas.ts`
- **Response Helpers**: `worker/api/response-helpers.ts`
