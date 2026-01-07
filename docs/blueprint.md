# API Blueprint - Akademia Pro

## Architecture Overview

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│  React   │────▶│   Service    │────▶│ Repository  │
│ Components  │     │  Query   │     │   Layer      │     │   Layer     │
└─────────────┘     └──────────┘     └──────────────┘     └─────────────┘
                                                                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │  apiClient      │
                                                         │  (Resilience)   │
                                                         └─────────────────┘
                                                                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │  Hono API       │
                                                         │  (Worker)       │
                                                         │                 │
                                                         │  - Rate Limit   │
                                                         │  - Timeout      │
                                                         │  - CORS         │
                                                         │  - Security     │
                                                         └─────────────────┘
                                                                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │ Durable Objects│
                                                         │   Storage       │
                                                         │   + Indexes    │
                                                         └─────────────────┘
```

---

## Data Architecture

### Storage Layer

The application uses **Cloudflare Workers Durable Objects** for persistent storage:

- **Single GlobalDurableObject**: Stores all entity data with optimistic locking
- **Primary Index**: Each entity type has a primary index for ID-based lookups
- **Secondary Indexes**: Field-based indexes for efficient query patterns

### Entities

| Entity | Primary Index | Secondary Indexes |
|---------|----------------|-------------------|
| UserEntity | ID | role, classId |
| ClassEntity | ID | teacherId |
| CourseEntity | ID | teacherId |
| GradeEntity | ID | studentId, courseId |
| AnnouncementEntity | ID | authorId |
| ScheduleEntity | ID | - |

### Index Performance

Before optimization, queries used full table scans:
```typescript
// Slow: Loads ALL users, then filters
const allUsers = await UserEntity.list(env);
const students = allUsers.items.filter(u => u.role === 'student');
```

After optimization, queries use indexed lookups:
```typescript
// Fast: Direct lookup by indexed field
const students = await UserEntity.getByRole(env, 'student');
```

### Index Rebuild

Secondary indexes can be rebuilt using:
```
POST /api/admin/rebuild-indexes
```

This clears and rebuilds all secondary indexes from existing data.

## Base URL

```
https://your-domain.workers.dev/api
```

## Versioning

Current version: **v1** (implicit in current endpoints)

Future versions will be prefixed: `/api/v2/...`

## Authentication

JWT authentication is fully implemented and integrated into all protected API routes.

### JWT Authentication Flow

```typescript
// Login request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "student"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  },
  "requestId": "uuid"
}

// Subsequent requests include header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Protected Routes**

All protected routes require authentication via the `authenticate()` middleware and enforce role-based authorization using the `authorize()` middleware:

- Student portal: `/api/students/*` (requires `student` role)
- Teacher portal: `/api/teachers/*` and `/api/grades/*` (requires `teacher` role)
- Admin portal: `/api/users/*` and `/api/admin/*` (requires `admin` role)

**Implementation Details**

- JWT token generation and verification: `worker/middleware/auth.ts`
- Login endpoint: `POST /api/auth/login` - `worker/auth-routes.ts`
- Token verification: `GET /api/auth/verify` - `worker/auth-routes.ts`
- Token expiration: 24 hours (configurable)
- Role-based authorization: All protected routes use `authorize(role)` middleware

## Request/Response Format

### Standard Response Structure

#### Success Response

```typescript
{
  "success": true,
  "data": <T>,
  "requestId": "uuid-v4"
}
```

#### Error Response

```typescript
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "requestId": "uuid-v4",
  "details?: Record<string, unknown>
}
```

### Request Headers

```typescript
{
  "Content-Type": "application/json",
  "X-Request-ID": "uuid-v4"  // Auto-generated if not provided
}
```

### Response Headers

```typescript
{
  "X-Request-ID": "uuid-v4",
  "Content-Type": "application/json",
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "95",
  "X-RateLimit-Reset": "1234567890"
}
```

## Error Codes

| Code | Status | Description | Retryable |
|------|--------|-------------|-----------|
| `NETWORK_ERROR` | N/A | Network connectivity issue | Yes |
| `TIMEOUT` | 408, 504 | Request timed out | Yes |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Yes |
| `SERVICE_UNAVAILABLE` | 503 | Service is down | Yes |
| `CIRCUIT_BREAKER_OPEN` | 503 | Circuit breaker triggered | No |
| `UNAUTHORIZED` | 401 | Authentication required | No |
| `FORBIDDEN` | 403 | Insufficient permissions | No |
| `NOT_FOUND` | 404 | Resource not found | No |
| `VALIDATION_ERROR` | 400 | Invalid input data | No |
| `CONFLICT` | 409 | Resource conflict | No |
| `BAD_REQUEST` | 400 | Malformed request | No |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error | Yes |

## Rate Limiting

| Endpoint Type | Window | Limit |
|--------------|--------|-------|
| Standard API | 15 min | 100 requests |
| Strict (seed, errors) | 5 min | 50 requests |
| Loose | 1 hour | 1000 requests |

Rate limit headers are included in all responses.

## Resilience Patterns

### Timeout

Default: 30 seconds

Configurable per request:
```typescript
{ timeout: 60000 }  // 60 seconds
```

### Retry

Automatic retry with exponential backoff:
- Max retries: 3 (for queries), 2 (for mutations)
- Base delay: 1000ms
- Backoff factor: 2
- Jitter: ±1000ms
- Non-retryable errors: 404, validation, auth

### Circuit Breaker

Threshold: 5 failures
Timeout: 60 seconds
Reset timeout: 30 seconds

State can be monitored via:
```typescript
getCircuitBreakerState()
```

---

## API Endpoints

### Health Check

#### GET /api/health

Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-07T12:00:00.000Z"
  },
  "requestId": "uuid"
}
```

---

### Database Seeding

#### POST /api/seed

Populate database with initial seed data.

**Rate Limit:** Strict (50 requests / 5 min)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Database seeded successfully."
  },
  "requestId": "uuid"
}
```

---

### Student Portal

#### GET /api/students/:id/dashboard

Retrieve student dashboard data including schedule, grades, and announcements.

**Path Parameters:**
- `id` (string) - Student ID

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "day": "Senin",
        "time": "08:00 - 09:30",
        "courseId": "math-11",
        "courseName": "Mathematics",
        "teacherName": "Ibu Siti"
      }
    ],
    "recentGrades": [
      {
        "id": "g-01",
        "studentId": "student-01",
        "courseId": "math-11",
        "score": 95,
        "feedback": "Excellent work!",
        "courseName": "Mathematics",
        "createdAt": "2026-01-07T10:00:00.000Z",
        "updatedAt": "2026-01-07T10:00:00.000Z"
      }
    ],
    "announcements": [
      {
        "id": "ann-01",
        "title": "Parent-Teacher Meeting",
        "content": "The meeting will be held next Saturday.",
        "date": "2026-01-07T09:00:00.000Z",
        "authorId": "admin-01",
        "authorName": "Admin Sekolah",
        "createdAt": "2026-01-07T08:00:00.000Z",
        "updatedAt": "2026-01-07T08:00:00.000Z"
      }
    ]
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Student not found or not a student

---

### Teacher Portal

#### GET /api/teachers/:id/classes

Get all classes taught by a teacher.

**Path Parameters:**
- `id` (string) - Teacher ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "11-A",
      "name": "Class 11-A",
      "teacherId": "teacher-01",
      "createdAt": "2026-01-07T08:00:00.000Z",
      "updatedAt": "2026-01-07T08:00:00.000Z"
    }
  ],
  "requestId": "uuid"
}
```

#### GET /api/classes/:id/students

Get students in a class with their grades.

**Path Parameters:**
- `id` (string) - Class ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-01",
      "name": "Budi Hartono",
      "score": 95,
      "feedback": "Excellent work!",
      "gradeId": "g-01"
    }
  ],
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Class not found

#### POST /api/grades

Create a new grade.

**Request Body:**
```json
{
  "studentId": "student-01",
  "courseId": "math-11",
  "score": 95,
  "feedback": "Excellent work!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "g-01",
    "studentId": "student-01",
    "courseId": "math-11",
    "score": 95,
    "feedback": "Excellent work!",
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 400 - Missing required fields (studentId, courseId)

#### PUT /api/grades/:id

Update an existing grade.

**Path Parameters:**
- `id` (string) - Grade ID

**Request Body:**
```json
{
  "score": 98,
  "feedback": "Outstanding!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "g-01",
    "studentId": "student-01",
    "courseId": "math-11",
    "score": 98,
    "feedback": "Outstanding!",
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:05:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 400 - Grade not created yet
- 404 - Grade not found

---

### Admin Portal

#### GET /api/users

Get all users with optional filtering.

**Query Parameters:**
- `role` (string, optional) - Filter by role (student, teacher, parent, admin)
- `classId` (string, optional) - Filter by class ID (for students)
- `teacherId` (string, optional) - Filter by teacher ID (for classes)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-01",
      "name": "Budi Hartono",
      "email": "budi@example.com",
      "role": "student",
      "avatarUrl": "https://i.pravatar.cc/150?u=student01",
      "classId": "11-A",
      "studentIdNumber": "12345",
      "createdAt": "2026-01-07T08:00:00.000Z",
      "updatedAt": "2026-01-07T08:00:00.000Z"
    }
  ],
  "requestId": "uuid"
}
```

#### POST /api/users

Create a new user.

**Request Body (Student):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "classId": "11-A",
  "studentIdNumber": "12347"
}
```

**Request Body (Teacher):**
```json
{
  "name": "Ms. Johnson",
  "email": "johnson@example.com",
  "role": "teacher",
  "classIds": ["11-A", "12-B"]
}
```

**Request Body (Parent):**
```json
{
  "name": "Parent Name",
  "email": "parent@example.com",
  "role": "parent",
  "childId": "student-01"
}
```

**Request Body (Admin):**
```json
{
  "name": "System Admin",
  "email": "admin2@example.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatarUrl": "",
    "classId": "11-A",
    "studentIdNumber": "12347",
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "requestId": "uuid"
}
```

#### PUT /api/users/:id

Update an existing user.

**Path Parameters:**
- `id` (string) - User ID

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "student-01",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student",
    "avatarUrl": "https://i.pravatar.cc/150?u=student01",
    "classId": "11-A",
    "studentIdNumber": "12345",
    "createdAt": "2026-01-07T08:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - User not found

#### DELETE /api/users/:id

Delete a user with referential integrity checking.

**Path Parameters:**
- `id` (string) - User ID

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "student-01",
    "deleted": true,
    "warnings": []
  },
  "requestId": "uuid"
}
```

**Response (With Warnings):**
```json
{
  "success": true,
  "data": {
    "id": "teacher-01",
    "deleted": false,
    "warnings": [
      "Teacher is assigned to 3 classes",
      "Teacher has 15 associated grades"
    ]
  },
  "requestId": "uuid"
}
```

---

### Error Reporting

#### POST /api/client-errors

Report client-side errors for monitoring.

**Rate Limit:** Strict (50 requests / 5 min)

**Request Body:**
```json
{
  "message": "Error message",
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-01-07T10:00:00.000Z",
  "stack": "Error stack trace",
  "componentStack": "React component stack",
  "errorBoundary": true,
  "errorBoundaryProps": {},
  "source": "component.js",
  "lineno": 42,
  "colno": 10
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "uuid"
}
```

**Error Responses:**
- 400 - Missing required fields (message)

---

## Webhook Management

Webhooks allow external systems to receive real-time notifications about events in the school management system.

### Supported Events

| Event Type | Description | Triggered When |
|------------|-------------|-----------------|
| `grade.created` | A new grade has been created | Teacher submits a grade for a student |
| `grade.updated` | An existing grade has been updated | Teacher modifies a grade score or feedback |
| `user.created` | A new user has been created | Admin creates a new user account |
| `user.updated` | An existing user has been updated | Admin updates user information |
| `user.deleted` | A user has been deleted | Admin deletes a user account |
| `announcement.created` | A new announcement has been created | Teacher or admin posts an announcement |
| `announcement.updated` | An existing announcement has been updated | Teacher or admin modifies an announcement |

### Webhook Payload Format

All webhooks receive a JSON payload with the following structure:

```json
{
  "id": "event-uuid-123",
  "eventType": "grade.created",
  "data": {
    "id": "g-01",
    "studentId": "student-01",
    "courseId": "math-11",
    "score": 95,
    "feedback": "Excellent work!",
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "timestamp": "2026-01-07T10:00:00.000Z"
}
```

### Webhook Signature Verification

To verify webhook authenticity:

1. Receive the `X-Webhook-Signature` header from the request
2. Compute the HMAC SHA-256 hash of the request body using your webhook secret
3. Compare with the received signature

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  return signature === expectedSignature;
}
```

### Retry Logic

Webhooks are retried with exponential backoff on delivery failures:

| Attempt | Delay |
|---------|-------|
| 1 | 1 minute |
| 2 | 5 minutes |
| 3 | 15 minutes |
| 4 | 30 minutes |
| 5 | 1 hour |
| 6 | 2 hours |

After 6 failed attempts, the webhook delivery is marked as failed and will not be retried.

---

### List All Webhook Configurations

#### GET /api/webhooks

Get all webhook configurations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "webhook-1",
      "url": "https://example.com/webhook",
      "events": ["grade.created", "grade.updated"],
      "secret": "hidden",
      "active": true,
      "createdAt": "2026-01-07T10:00:00.000Z",
      "updatedAt": "2026-01-07T10:00:00.000Z"
    }
  ],
  "requestId": "uuid"
}
```

---

### Get Webhook Configuration

#### GET /api/webhooks/:id

Get details of a specific webhook configuration.

**Path Parameters:**
- `id` (string) - Webhook configuration ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook-1",
    "url": "https://example.com/webhook",
    "events": ["grade.created", "grade.updated"],
    "secret": "your-webhook-secret",
    "active": true,
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Webhook configuration not found

---

### Create Webhook Configuration

#### POST /api/webhooks

Create a new webhook configuration.

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["grade.created", "grade.updated"],
  "secret": "your-webhook-secret",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook-1",
    "url": "https://example.com/webhook",
    "events": ["grade.created", "grade.updated"],
    "secret": "your-webhook-secret",
    "active": true,
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:00:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 400 - Missing required fields (url, events, secret)

---

### Update Webhook Configuration

#### PUT /api/webhooks/:id

Update an existing webhook configuration.

**Path Parameters:**
- `id` (string) - Webhook configuration ID

**Request Body:**
```json
{
  "url": "https://example.com/new-webhook",
  "events": ["grade.created"],
  "active": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook-1",
    "url": "https://example.com/new-webhook",
    "events": ["grade.created"],
    "secret": "your-webhook-secret",
    "active": false,
    "createdAt": "2026-01-07T10:00:00.000Z",
    "updatedAt": "2026-01-07T10:05:00.000Z"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Webhook configuration not found

---

### Delete Webhook Configuration

#### DELETE /api/webhooks/:id

Delete a webhook configuration.

**Path Parameters:**
- `id` (string) - Webhook configuration ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook-1",
    "deleted": true
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Webhook configuration not found

---

### Get Webhook Delivery History

#### GET /api/webhooks/:id/deliveries

Get delivery history for a specific webhook configuration.

**Path Parameters:**
- `id` (string) - Webhook configuration ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "delivery-1",
      "eventId": "event-1",
      "webhookConfigId": "webhook-1",
      "status": "delivered",
      "statusCode": 200,
      "attempts": 1,
      "createdAt": "2026-01-07T10:00:00.000Z",
      "updatedAt": "2026-01-07T10:00:01.000Z"
    }
  ],
  "requestId": "uuid"
}
```

---

### List All Webhook Events

#### GET /api/webhooks/events

Get all webhook events.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "eventType": "grade.created",
      "data": {
        "id": "g-01",
        "studentId": "student-01",
        "courseId": "math-11",
        "score": 95
      },
      "processed": true,
      "createdAt": "2026-01-07T10:00:00.000Z",
      "updatedAt": "2026-01-07T10:00:00.000Z"
    }
  ],
  "requestId": "uuid"
}
```

---

### Get Webhook Event Details

#### GET /api/webhooks/events/:id

Get details of a specific webhook event including delivery attempts.

**Path Parameters:**
- `id` (string) - Event ID

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "event-1",
      "eventType": "grade.created",
      "data": { ... },
      "processed": true,
      "createdAt": "2026-01-07T10:00:00.000Z",
      "updatedAt": "2026-01-07T10:00:00.000Z"
    },
    "deliveries": [
      {
        "id": "delivery-1",
        "eventId": "event-1",
        "webhookConfigId": "webhook-1",
        "status": "delivered",
        "statusCode": 200,
        "attempts": 1,
        "createdAt": "2026-01-07T10:00:00.000Z",
        "updatedAt": "2026-01-07T10:00:01.000Z"
      }
    ]
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 404 - Webhook event not found

---

### Test Webhook Configuration

#### POST /api/webhooks/test

Test a webhook configuration without saving it.

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "secret": "your-webhook-secret"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "status": 200,
    "response": "OK"
  },
  "requestId": "uuid"
}
```

**Error Responses:**
- 400 - Missing required fields (url, secret)

---

### Process Pending Webhook Deliveries

#### POST /api/admin/webhooks/process

Manually trigger processing of pending webhook deliveries.

**Note:** This endpoint is typically called by a scheduled job, but can be triggered manually for testing.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Pending webhook deliveries processed"
  },
  "requestId": "uuid"
}
```

---

## Security Headers

---

## Security Headers

All `/api/*` responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
```

## CORS Configuration

CORS is configured via `ALLOWED_ORIGINS` environment variable.

Example: `http://localhost:3000,http://localhost:4173,https://yourdomain.com`

Default fallback: `http://localhost:3000,http://localhost:4173`

---

## Integration Architecture

### Complete Resilience Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React App)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │ React Components  │─────▶│ React Query      │              │
│  └──────────────────┘      └──────────────────┘              │
│                                      │                        │
│                                      ▼                        │
│                              ┌──────────────────┐              │
│                              │ apiClient        │              │
│                              ├──────────────────┤              │
│                              │ • Circuit       │              │
│                              │   Breaker      │              │
│                              │ • Retry         │              │
│                              │ • Timeout       │              │
│                              └──────────────────┘              │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP Request
                                  │ (with timeout, retry, CB)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Cloudflare Worker)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │ Rate Limiting    │─────▶│ Security        │              │
│  │ Middleware      │      │ Middleware      │              │
│  └──────────────────┘      └──────────────────┘              │
│                                      │                        │
│                                      ▼                        │
│                              ┌──────────────────┐              │
│                              │ Timeout         │              │
│                              │ Middleware      │              │
│                              └──────────────────┘              │
│                                      │                        │
│                                      ▼                        │
│                              ┌──────────────────┐              │
│                              │ Auth & Role     │              │
│                              │ Middleware      │              │
│                              └──────────────────┘              │
│                                      │                        │
│                                      ▼                        │
│                              ┌──────────────────┐              │
│                              │ API Routes      │              │
│                              │ (Hono)         │              │
│                              └──────────────────┘              │
│                                      │                        │
│                                      ▼                        │
│                              ┌──────────────────┐              │
│                              │ Durable Objects │              │
│                              │ (Storage)       │              │
│                              └──────────────────┘              │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
                          ┌──────────────────┐
                          │ Webhook Queue   │
                          │ (Retry System)  │
                          └──────────────────┘
```

### Request Flow with Resilience

**1. Frontend Request:**
```
React Component → React Query → apiClient → Circuit Breaker
                                                    │
                                                    ├─ Open? → Reject (503)
                                                    └─ Closed? → Continue
```

**2. Circuit Breaker Checks:**
- Check if circuit is open (5 consecutive failures)
- If open, reject immediately with `CIRCUIT_BREAKER_OPEN` error
- If closed, proceed with retry logic

**3. Retry Logic:**
```
Execute Request → Success? → Return Response
                    ↓
                  Failure?
                    ├─ Retryable? → Wait (exponential backoff) → Retry (max 3)
                    └─ Non-retryable? → Throw Error
```

**4. Timeout Protection:**
```
Start Request → Timeout Timer (30s)
                    │
                    ├─ Complete before timeout? → Return Response
                    └─ Timeout reached? → Abort & Throw TIMEOUT Error
```

**5. Backend Processing:**
```
Request → Rate Limit → Timeout → Auth → Route → DB
            │           │         │       │      │
            ▼           ▼         ▼       ▼      ▼
          Check       30s      JWT    Role   DO
         Limits     Max        Verify  Check   Op
```

**6. Response with Headers:**
```
Response → Rate Limit Headers + Request ID + Error Code
          │
          ├─ X-RateLimit-Limit: 100
          ├─ X-RateLimit-Remaining: 95
          ├─ X-RateLimit-Reset: 1234567890
          ├─ X-Request-ID: uuid-v4
          └─ X-Content-Type-Options: nosniff
```

### Failure Cascade Prevention

**Circuit Breaker Pattern:**
- **Prevents cascading failures** when backend is degraded
- **Fast failure** (immediate 503 response) instead of hanging
- **Automatic recovery** after reset timeout (30 seconds)

**Implementation:**
```typescript
class CircuitBreaker {
  private state: { isOpen: boolean; failureCount: number };
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      throw new Error('Circuit breaker is open'); // Fast failure
    }
    try {
      const result = await fn();
      this.onSuccess(); // Reset failure count
      return result;
    } catch (error) {
      this.onFailure(); // Increment failure count
      throw error; // Propagate error
    }
  }
}
```

**Exponential Backoff Retry:**
- **Prevents thundering herd** when backend recovers
- **Gradual retry** with increasing delays (1s, 2s, 4s)
- **Jitter** to synchronize retries from multiple clients

**Implementation:**
```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !error.retryable) throw error;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay); // Exponential backoff + jitter
    }
  }
}
```

**Rate Limiting:**
- **Protects backend** from overload
- **Fair resource allocation** across all clients
- **Graceful degradation** with Retry-After header

**Implementation:**
```typescript
export function rateLimit(options: RateLimitMiddlewareOptions) {
  return async (c: Context, next: Next) => {
    const entry = getOrCreateEntry(key, config);
    
    if (entry.count > config.maxRequests) {
      c.header('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }
    
    await next();
  };
}
```

### Webhook Delivery Flow

```
┌─────────────────┐
│  API Route     │ (e.g., POST /api/grades)
│  (Create Grade)│
└────────┬────────┘
         │
         ├─ Create Grade Entity
         │
         ├─ Trigger Webhook Event
         │
         ▼
┌─────────────────┐
│  Webhook       │ (WebhookEventEntity)
│  Event Queue   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook       │ (WebhookService.processPendingDeliveries)
│  Processor    │ (Scheduled job: every 1 minute)
└────────┬────────┘
         │
         ├─ For each active webhook config
         ├─ For each pending event
         │
         ▼
┌─────────────────┐
│  Delivery      │ (WebhookDeliveryEntity)
│  Attempt       │
└────────┬────────┘
         │
         ├─ POST to webhook URL
         ├─ With HMAC signature
         ├─ Timeout: 30 seconds
         │
         ▼
         ├─ Success? → Mark as "delivered"
         └─ Failed? → Schedule retry (exponential backoff)
                      │
                      ├─ Attempt 1: 1 min
                      ├─ Attempt 2: 5 min
                      ├─ Attempt 3: 15 min
                      ├─ Attempt 4: 30 min
                      ├─ Attempt 5: 1 hour
                      └─ Attempt 6: 2 hours → Mark as "failed"
```

### Integration Patterns

### Error Response Standardization

All API endpoints use standardized error response helpers from `worker/core-utils.ts`:

```typescript
// Available error response helpers
ok(c, data)              // 200 - Success
bad(c, message, code)     // 400 - Bad request / validation error
unauthorized(c, message)  // 401 - Authentication required
forbidden(c, message)    // 403 - Authorization failed
notFound(c, message)      // 404 - Resource not found
conflict(c, message)     // 409 - Resource conflict
rateLimitExceeded(c)     // 429 - Rate limit exceeded
serverError(c, message)   // 500 - Internal server error
serviceUnavailable(c)     // 503 - Service unavailable
gatewayTimeout(c, message)// 504 - Gateway timeout
```

All error responses include:
- `success: false`
- `error`: Human-readable error message
- `code`: Standardized error code (from `ErrorCode` enum)
- `requestId`: UUID for request tracing

### Using apiClient (Frontend)

```typescript
import { apiClient } from '@/lib/api-client';

// Basic GET request
const data = await apiClient<StudentDashboardData>('/api/students/student-01/dashboard');

// With custom timeout
const data = await apiClient<Student>('/api/users/student-01', {
  timeout: 60000
});

// Disable circuit breaker for critical operations
const data = await apiClient<Grade>('/api/grades/g-01', {
  circuitBreaker: false
});
```

### Using React Query Hooks

```typescript
import { useQuery, useMutation } from '@/lib/api-client';

// Fetch data
const { data, isLoading, error } = useQuery<StudentDashboardData>(
  ['students', 'student-01', 'dashboard'],
  { timeout: 30000 }
);

// Mutate data
const createGradeMutation = useMutation<Grade, Error, Partial<Grade>>(
  ['grades'],
  { timeout: 60000 }
);

createGradeMutation.mutate({
  studentId: 'student-01',
  courseId: 'math-11',
  score: 95,
  feedback: 'Excellent!'
});
```

### Using Service Layer

```typescript
import { studentService } from '@/services/studentService';

const dashboard = await studentService.getDashboard('student-01');
const grades = await studentService.getGrades('student-01');
const schedule = await studentService.getSchedule('student-01');
```

### Error Handling

```typescript
import { ErrorCode } from '@/lib/api-client';

try {
  const data = await apiClient<SomeType>('/api/endpoint');
} catch (error) {
  const apiError = error as ApiError;
  
  console.error(`Error code: ${apiError.code}`);
  console.error(`Status: ${apiError.status}`);
  console.error(`Retryable: ${apiError.retryable}`);
  console.error(`Request ID: ${apiError.requestId}`);
  
  // Handle specific errors
  switch (apiError.code) {
    case ErrorCode.NOT_FOUND:
      // Show 404 UI
      break;
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      // Show rate limit message
      break;
    case ErrorCode.TIMEOUT:
      // Show timeout message with retry option
      break;
  }
}
```

---

## Logging Strategy

### Frontend Logging

Use the centralized logger utility for consistent logging across the application:

```typescript
import { logger } from '@/lib/logger';

// Basic logging
logger.info('User logged in', { userId, email });
logger.warn('Cache miss', { key });
logger.error('API request failed', error, { endpoint, status });

// Child logger for request-scoped context
const requestLogger = createChildLogger({ requestId, userId });
requestLogger.info('Processing request');
requestLogger.error('Processing failed', err);
```

### Worker Logging

Worker-specific logger with environment-based filtering:

```typescript
import { logger } from '../logger';

logger.info('Migration applied', { id, description });
logger.error('Auth failed', error, { tokenHash: hash(token) });
```

### Log Levels

| Level | Usage | Environment |
|-------|-------|-------------|
| `debug` | Detailed diagnostics | Development only |
| `info` | General informational messages | Development + Production |
| `warn` | Warning conditions | Development + Production |
| `error` | Error conditions | Development + Production |

### Configuration

Environment variable: `VITE_LOG_LEVEL` (frontend) or `LOG_LEVEL` (worker)

```bash
# .env
VITE_LOG_LEVEL=debug  # Development
VITE_LOG_LEVEL=info   # Production
```

### Structured Logging

All logs include:
- Timestamp (ISO 8601 format)
- Log level
- Message
- Context object (optional)
- Error details (for error level)

Example output:
```json
{
  "level": 30,
  "time": "2026-01-07T11:48:17.000Z",
  "msg": "User logged in",
  "userId": "student-01",
  "email": "student@example.com"
}
```

---

## Monitoring & Debugging

### Circuit Breaker State

Monitor circuit breaker status:

```typescript
import { getCircuitBreakerState } from '@/lib/api-client';

const state = getCircuitBreakerState();
console.log({
  isOpen: state.isOpen,
  failureCount: state.failureCount,
  lastFailureTime: state.lastFailureTime,
  nextAttemptTime: state.nextAttemptTime
});
```

### Request Tracing

All requests include `X-Request-ID` header for tracing:
- Auto-generated on client
- Passed through to server
- Returned in all responses
- Log requestId when debugging issues

---

## Best Practices

1. **Always handle errors** - Check error codes and user-friendly messages
2. **Respect rate limits** - Monitor `X-RateLimit-Remaining` header
3. **Use React Query** - Leverage caching, deduplication, and automatic retries
4. **Set appropriate timeouts** - Default 30s, adjust for long-running operations
5. **Log request IDs** - Include requestId in error reports for debugging
6. **Don't disable circuit breaker** - Only in exceptional circumstances
7. **Use service layer** - Abstract API calls behind services for testability
8. **Validate inputs** - Use Zod schemas for request/response validation
9. **Use centralized logger** - Import from `@/lib/logger` (frontend) or `../logger` (worker) for consistent logging
10. **Use standardized error helpers** - Always use proper helper functions (unauthorized, forbidden, etc.) instead of manual JSON responses
11. **Verify webhook signatures** - Always verify `X-Webhook-Signature` header for incoming webhooks to prevent spoofing
12. **Use retry logic for webhooks** - Webhook system automatically retries with exponential backoff, no need to implement retry logic
13. **Process webhook deliveries regularly** - Use scheduled jobs to call `POST /api/admin/webhooks/process` for timely delivery

---

## Integration Monitoring & Troubleshooting

### Circuit Breaker Monitoring

Monitor circuit breaker state to detect service degradation:

```typescript
import { getCircuitBreakerState } from '@/lib/api-client';

const state = getCircuitBreakerState();

if (state.isOpen) {
  console.warn('Circuit breaker is open', {
    failureCount: state.failureCount,
    lastFailureTime: new Date(state.lastFailureTime).toISOString(),
    nextAttemptTime: new Date(state.nextAttemptTime).toISOString(),
  });
}
```

**Circuit Breaker States:**
- **Closed**: Normal operation, requests flow through
- **Open**: Threshold exceeded (5 failures), requests rejected immediately
- **Half-Open**: Attempting to recover (automatic after reset timeout)

**Manual Reset (Use with Caution):**
```typescript
import { resetCircuitBreaker } from '@/lib/api-client';
resetCircuitBreaker();
```

### Rate Limit Monitoring

Monitor rate limit headers to track API usage:

```typescript
import { apiClient } from '@/lib/api-client';

const response = await fetch('/api/users', {
  headers: { 'Authorization': 'Bearer token' }
});

const limit = response.headers.get('X-RateLimit-Limit');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

console.log(`Rate limit: ${remaining}/${limit}, resets at ${new Date(parseInt(reset) * 1000)}`);
```

### Request Tracing

All requests include `X-Request-ID` header for distributed tracing:

```typescript
const requestId = crypto.randomUUID();
const response = await fetch('/api/users', {
  headers: { 'X-Request-ID': requestId }
});

const responseId = response.headers.get('X-Request-ID');
console.log(`Request ${requestId} → Response ${responseId}`);
```

Log request IDs for debugging integration issues:
```typescript
import { logger } from '@/lib/logger';

try {
  const data = await apiClient<User>('/api/users/user-01');
  logger.info('User fetched successfully', { userId: data.id });
} catch (error) {
  logger.error('Failed to fetch user', error, {
    requestId: (error as ApiError).requestId,
    endpoint: '/api/users/user-01'
  });
}
```

### Integration Testing Strategy

**Unit Tests (Fast, Isolated):**
- Mock apiClient with controlled responses
- Test service layer business logic
- Verify error handling with mock errors
- Example: `src/services/__tests__/studentService.test.ts`

**Integration Tests (Slower, Real API):**
- Test against actual API endpoints
- Verify resilience patterns (retry, circuit breaker, timeout)
- Check rate limiting behavior
- Example: `src/lib/__tests__/api-client.test.ts`

**End-to-End Tests (Slowest, Full Flow):**
- Test complete user journeys
- Verify webhook delivery
- Test failure scenarios
- Use environment with mocked external services

### Troubleshooting Common Issues

**Problem: Requests failing with "Circuit breaker is open"**

Diagnosis:
```typescript
const state = getCircuitBreakerState();
console.log('Circuit breaker state:', state);
```

Solutions:
1. Check if backend service is healthy: `GET /api/health`
2. Review error logs for recurring failures
3. Verify network connectivity to backend
4. Wait for automatic reset (30 seconds after opening)
5. Manual reset only if root cause is resolved (not recommended)

**Problem: Rate limit exceeded (429 errors)**

Diagnosis:
- Check `X-RateLimit-Remaining` header
- Review `X-RateLimit-Reset` timestamp

Solutions:
1. Implement backoff using `Retry-After` header
2. Reduce request frequency
3. Batch multiple operations into single request
4. Cache responses using React Query
5. Consider upgrading plan (if applicable)

**Problem: Requests timing out (408 errors)**

Diagnosis:
- Check default timeout (30 seconds)
- Review server-side timeout configuration

Solutions:
1. Increase timeout for long-running operations:
   ```typescript
   await apiClient('/api/users', { timeout: 60000 }); // 60 seconds
   ```
2. Optimize server-side queries (use indexes, N+1 fixes)
3. Implement pagination for large datasets
4. Use background processing for heavy operations

**Problem: Webhook delivery failures**

Diagnosis:
```typescript
// Check delivery history
const deliveries = await apiClient<WebhookDelivery[]>('/api/webhooks/webhook-1/deliveries');

// Filter failed deliveries
const failed = deliveries.filter(d => d.status === 'failed');
console.log('Failed webhook deliveries:', failed);
```

Solutions:
1. Verify webhook endpoint is accessible
2. Check webhook signature verification on receiver side
3. Review webhook server logs for errors
4. Manually trigger retry: `POST /api/admin/webhooks/process`
5. Test webhook configuration: `POST /api/webhooks/test`

### Health Check & Monitoring

Implement periodic health checks:

```typescript
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data.data.status === 'healthy';
  } catch (error) {
    logger.error('Health check failed', error);
    return false;
  }
}

setInterval(checkApiHealth, 60000); // Check every minute
```

Monitor key metrics:
- Circuit breaker state (open/closed)
- Rate limit usage (remaining/limit)
- Request latency (p50, p95, p99)
- Error rates (by status code, error type)
- Webhook delivery success rate

### Production Deployment Checklist

Before deploying to production:

1. **Environment Variables:**
   - `ALLOWED_ORIGINS`: Set to production domains
   - `LOG_LEVEL`: Set to `info` or `error`
   - `VITE_LOG_LEVEL`: Set to `info` or `error`

2. **Rate Limiting:**
   - Verify rate limits are appropriate for production traffic
   - Monitor rate limit headers during initial deployment
   - Adjust limits if necessary

3. **Timeout Configuration:**
   - Review default timeout (30 seconds) for production workloads
   - Set longer timeouts for known slow operations
   - Monitor timeout errors during deployment

4. **Circuit Breaker:**
   - Verify threshold (5 failures) is appropriate
   - Monitor circuit breaker state during deployment
   - Alert on circuit breaker trips

5. **Webhook Configuration:**
   - Verify webhook URLs are accessible from production
   - Test webhook signature verification
   - Monitor webhook delivery success rate
   - Set up alerts for failed webhook deliveries

6. **Logging:**
   - Ensure structured logging is enabled
   - Log request IDs for tracing
   - Monitor error rates and log volumes
   - Set up log aggregation and alerting

7. **Security:**
   - Verify CORS configuration
   - Check security headers are applied
   - Audit webhook secrets are properly stored
   - Review rate limiting on sensitive endpoints

8. **Monitoring:**
   - Set up health check monitoring
   - Monitor circuit breaker state
   - Track rate limit usage
   - Monitor webhook delivery rates
   - Set up alerts for error thresholds

---

## Future Enhancements

### Planned Features

1. **API Versioning** - Introduce `/api/v2/` for breaking changes
2. **Pagination** - Add cursor-based pagination to list endpoints
3. **Webhooks** - ✅ **Completed** - Event notifications for grade updates, user changes, and announcements with retry logic
4. **Search** - Full-text search across users, classes, grades
5. **Export** - CSV/PDF export for grades and schedules
6. **Audit Log** - Track all CRUD operations for compliance (middleware exists but not yet integrated)

### Monitoring

1. **Metrics** - Add Prometheus metrics for request latency, error rates
2. **Tracing** - OpenTelemetry integration for distributed tracing
3. **Logging** - ✅ Structured logging with correlation IDs (implemented using pino and X-Request-ID header)
4. **Alerting** - Alert on circuit breaker trips, high error rates

---

## Testing

### Unit Testing

```typescript
import { createStudentService } from '@/services/studentService';
import { MockRepository } from '@/test/mocks';

const mockRepo = new MockRepository();
mockRepo.setMockData('/api/students/student-01/dashboard', mockData);

const service = createStudentService(mockRepo);
const dashboard = await service.getDashboard('student-01');
```

### Integration Testing

```typescript
import { apiClient } from '@/lib/api-client';

const response = await apiClient('/api/health');
expect(response.status).toBe('healthy');
```

---

## Support & Documentation

- **GitHub Issues**: Report bugs and feature requests
- **Wiki**: Additional documentation and guides
- **Code**: Open source at https://github.com/cpa01cmz-beep/web-sekolah
- **State Management Guidelines**: Comprehensive guide to frontend state patterns ([docs/STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md))
- **State Management Examples**: Real-world examples and best practices ([docs/STATE_MANAGEMENT_EXAMPLES.md](./STATE_MANAGEMENT_EXAMPLES.md))

---

*Last Updated: 2026-01-07*
*API Version: 1.0*
