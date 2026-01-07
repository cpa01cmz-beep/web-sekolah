# Akademia Pro - Technical Blueprint

## Architecture Overview

Akademia Pro follows a modern, scalable architecture leveraging Cloudflare's edge computing platform. The system is divided into three main layers:

1. **Frontend Layer**: React-based SPA served through Vite
2. **Backend Layer**: Hono.js API running on Cloudflare Workers
3. **Data Layer**: Cloudflare Durable Objects for stateful data storage

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │    Backend       │    │      Data          │
│   (React/Vite)  │◄──►│ (Hono/Workers)   │◄──►│ (Durable Objects)  │
└─────────────────┘    └──────────────────┘    └────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Framework**: Hono.js
- **Platform**: Cloudflare Workers
- **API Design**: RESTful principles with JSON responses
- **Authentication**: JWT-based authentication (planned)
- **Rate Limiting**: Custom in-memory rate limiter
- **Timeout Handling**: Request timeout middleware

### Data Layer
- **Storage**: Cloudflare Durable Objects
- **Data Modeling**: TypeScript interfaces shared between frontend and backend

### Development & Deployment
- **Language**: TypeScript (end-to-end)
- **Package Manager**: Bun
- **Deployment**: Cloudflare Workers via Wrangler
- **CI/CD**: GitHub Actions

## Project Structure

```
akademia-pro/
├── src/                  # Frontend application
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components for routing
│   │   ├── student/      # Student portal pages
│   │   ├── teacher/      # Teacher portal pages
│   │   ├── parent/       # Parent portal pages
│   │   ├── admin/        # Admin portal pages
│   │   └── public/       # Public pages (landing, login)
│   ├── store/            # Zustand stores for state management
│   └── App.tsx           # Main application component
├── worker/               # Backend application
│   ├── api/              # API route handlers
│   ├── lib/              # Backend utility functions
│   ├── middleware/       # Authentication and validation middleware
│   └── index.ts          # Worker entry point
├── shared/               # Shared types and interfaces
├── public/               # Static assets
└── tests/                # Test files
```

## Architectural Patterns

### Repository Pattern

The application uses a Repository Pattern to decouple service layer logic from HTTP client implementation, promoting testability and adhering to the Dependency Inversion Principle.

**Structure**:

```
src/
├── repositories/
│   ├── IRepository.ts         # Repository interface
│   ├── ApiRepository.ts       # HTTP implementation
│   └── index.ts              # Barrel export
└── services/
    ├── serviceContracts.ts     # Service interfaces
    └── *[service].ts         # Service implementations
```

**Benefits**:
- **Testability**: Services can be tested with mock repositories
- **Flexibility**: HTTP client implementation can be swapped without modifying services
- **SOLID Principles**: Follows Dependency Inversion Principle
- **Maintainability**: Clear separation of concerns

**Usage Example**:

```typescript
// Default usage (backward compatible)
import { studentService } from '@/services/studentService';

// With custom repository for testing
import { createStudentService } from '@/services/studentService';
import { MockRepository } from '@/test/mocks';

const mockStudentService = createStudentService(new MockRepository());
```

**Repository Interface**:

```typescript
export interface IRepository {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
}
```

## Core Components

### 1. Authentication System
- Unified login portal for all user roles
- JWT-based session management
- Role-based access control (RBAC)
- Password reset and account recovery

### 2. User Portals
- **Student Portal**: Dashboard, schedule, grades, digital ID, announcements
- **Teacher Portal**: Class management, grade submission, announcements
- **Parent Portal**: Progress tracking, communication tools
- **Admin Portal**: User management, system configuration, analytics

### 3. Data Management
- Durable Objects for each entity type (Users, Classes, Grades, etc.)
- Real-time data synchronization
- Backup and recovery procedures

### 4. Communication System
- Internal messaging between users
- Announcement broadcasting
- Notification system (email, in-app)

## API Resilience & Integration Patterns

### Overview

The API client and backend are designed with resilience at their core, implementing several patterns to ensure reliability and graceful degradation.

### Client-Side Resilience Patterns

#### Circuit Breaker

The API client implements a circuit breaker pattern to prevent cascading failures:

```typescript
// Automatically opens when failures exceed threshold
const circuitBreaker = new CircuitBreaker(
  5,      // failure threshold
  60000,  // timeout in ms
  30000   // reset timeout in ms
);

// Use in API calls
const data = await apiClient<DataType>(endpoint, {
  circuitBreaker: true  // enabled by default
});
```

**Behavior:**
- **Closed**: Requests flow normally
- **Open**: Requests fail fast with 503 status after threshold failures
- **Half-Open**: Test requests allowed after reset timeout
- Auto-recovery after successful requests

#### Exponential Backoff

Automatic retry with exponential backoff for retryable errors:

```typescript
// Retry configuration
retry: (failureCount, error: ApiError) => {
  if (!error.retryable) return false;
  if (failureCount >= 3) return false;
  return true;
},
retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000)
```

**Retry Strategy:**
- Base delay: 1000ms
- Backoff factor: 2x (exponential)
- Max delay: 30 seconds
- Max retries: 3 for queries, 2 for mutations

#### Timeout Handling

All API requests include configurable timeouts:

```typescript
// Default timeout: 30 seconds
const data = await apiClient<DataType>(endpoint);

// Custom timeout
const data = await apiClient<DataType>(endpoint, {
  timeout: 60000  // 60 seconds
});
```

### Server-Side Resilience Patterns

#### Rate Limiting

Multiple rate limiting strategies for different endpoint types:

```typescript
// Default: 100 requests per 15 minutes
import { defaultRateLimiter } from './middleware/rate-limit';

// Strict: 50 requests per 5 minutes (auth endpoints)
import { strictRateLimiter } from './middleware/rate-limit';

// Loose: 1000 requests per hour
import { looseRateLimiter } from './middleware/rate-limit';
```

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1704067200
Retry-After: 900
```

#### Request Timeout

Server-side timeout middleware to prevent long-running requests:

```typescript
import { defaultTimeout, shortTimeout, longTimeout } from './middleware/timeout';

// Default: 30 seconds
app.use('/api/*', defaultTimeout());

// Custom timeouts for specific endpoints
app.use('/api/heavy-operation', longTimeout());  // 60 seconds
```

### Error Handling & Standardization

#### Error Codes

All API errors include standardized error codes:

```typescript
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}
```

#### Error Response Format

Standardized error response format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "requestId": "uuid-v4",
  "details": {
    "field": "Additional context"
  }
}
```

#### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "requestId": "uuid-v4"
}
```

### Request Tracing

All requests include a unique request ID for distributed tracing:

```typescript
// Frontend: Automatically generated
const requestId = crypto.randomUUID();

// Backend: Added to response headers
c.header('X-Request-ID', requestId);
```

### Retryable Errors

The system automatically determines which errors are retryable:

- **Retryable:** 408 (Timeout), 429 (Rate Limit), 5xx (Server Errors)
- **Non-Retryable:** 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)

### Monitoring & Observability

#### Circuit Breaker State

Monitor circuit breaker state:

```typescript
import { getCircuitBreakerState, resetCircuitBreaker } from './api-client';

const state = getCircuitBreakerState();
// { isOpen: false, failureCount: 0, lastFailureTime: 0, nextAttemptTime: 0 }

if (state.isOpen) {
  console.log('Circuit breaker is open, failing fast');
}

// Manual reset (use with caution)
resetCircuitBreaker();
```

#### Rate Limit Monitoring

Monitor rate limit store:

```typescript
import { getRateLimitStore, clearRateLimitStore } from './middleware/rate-limit';

const store = getRateLimitStore();
store.forEach((value, key) => {
  console.log(`${key}: ${value.count}/${value.resetTime}`);
});
```

### Best Practices

1. **Always use timeouts**: Never make requests without reasonable timeout limits
2. **Handle circuit breaker**: Monitor and respond to open circuit breaker state
3. **Implement fallbacks**: Provide degraded functionality when services are down
4. **Log request IDs**: Use request IDs for tracing and debugging
5. **Respect rate limits**: Monitor X-RateLimit headers and implement backoff
6. **Graceful degradation**: Show user-friendly messages when services are unavailable
7. **Idempotent operations**: Design mutations to be safely retryable

### Configuration

Default configurations can be adjusted in:

- **Client**: `src/lib/api-client.ts`
  - Circuit breaker threshold, timeout, reset duration
  - Retry count, base delay, max delay
  - Request timeout

- **Server**: `worker/middleware/rate-limit.ts`, `worker/middleware/timeout.ts`
  - Rate limit windows and max requests
  - Request timeout values
  - Rate limiter key generation

## API Design

### Authentication Endpoints
```
POST   /api/auth/login     # User login
POST   /api/auth/logout    # User logout
POST   /api/auth/register  # User registration (admin only)
```

### User Endpoints
```
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update user profile
GET    /api/users/:id       # Get specific user (admin only)
```

### Student-Specific Endpoints
```
GET    /api/student/schedule   # Get class schedule
GET    /api/student/grades     # Get grades
GET    /api/student/card       # Get digital student card
```

### Teacher-Specific Endpoints
```
GET    /api/teacher/classes    # Get assigned classes
POST   /api/teacher/grades     # Submit grades
POST   /api/teacher/announce   # Post announcement
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: Date;
  lastLogin: Date;
}
```

### Student
```typescript
interface Student extends User {
  studentId: string;
  gradeLevel: number;
  classId: string;
  parentId: string; // Reference to parent user
}
```

### Teacher
```typescript
interface Teacher extends User {
  teacherId: string;
  subject: string;
  classIds: string[]; // References to classes
}
```

## Security Considerations

- All API endpoints protected with authentication middleware
- Role-based access control for all resources
- Input validation and sanitization using Zod
- Secure JWT implementation with short expiration times
- HTTPS enforcement for all connections
- Regular security audits and dependency updates

## Performance Optimization

- Edge computing with Cloudflare Workers for low latency
- Asset caching with Cloudflare CDN
- Code splitting for frontend bundles
- Lazy loading for non-critical components
- Database query optimization through Durable Objects
- Response compression and minification

## Deployment Architecture

```
Users ───► Cloudflare Edge Network ───► Cloudflare Workers ───► Durable Objects
              │                              │
              │                              └── Static Assets (Vite Build)
              └── Caching, DDoS Protection, WAF
```

## Monitoring & Analytics

- Cloudflare Workers analytics
- Custom logging with Pino
- Error tracking and reporting
- Performance metrics collection
- User behavior analytics (opt-in)

## Future Extensibility

- Mobile application development (React Native)
- Integration with third-party educational tools
- AI-powered analytics and recommendations
- Multi-language support
- Advanced reporting and dashboard customization