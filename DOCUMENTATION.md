# Akademia Pro - Complete Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
    - [Components](#components)
    - [State Management](#state-management)
    - [Routing](#routing)
5. [Backend Architecture](#backend-architecture)
    - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Webhook System](#webhook-system)
6. [Data Layer](#data-layer)
7. [Resilience & Performance](#resilience--performance)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Contributing](#contributing)
11. [License](#license)

## Introduction

Akademia Pro is a modern, all-in-one school management portal designed to streamline communication and information access for students, teachers, parents, and administrators. Built with cutting-edge technologies, it provides a seamless user experience across all devices while maintaining high performance and security standards.

## Getting Started

### Prerequisites

Before you begin, ensure you have following installed:
- [Node.js](https://nodejs.org/) (recommended: v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare Workers CLI)
- Git

### Installation

1. Clone repository:
    ```bash
    git clone https://github.com/cpa01cmz-beep/web-sekolah.git
    ```

2. Navigate to project directory:
    ```bash
    cd web-sekolah
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Configure environment variables:
    ```bash
    cp .env.example .env
    ```

    Update `.env` file with your configuration. For local development, defaults in `.env.example` should work. For production deployment, ensure you update `ALLOWED_ORIGINS` and `JWT_SECRET` values.

### Development Setup

1. Start development server:
    ```bash
    npm run dev
    ```

2. The application will be available at `http://localhost:3000` (or port specified in your environment).

3. For backend-only development, you can also run worker separately:
    ```bash
    wrangler dev worker/index.ts
    ```

## Project Structure

```
web-sekolah/
├── src/                    # Frontend application
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files (navigation, etc.)
│   ├── constants/          # Shared constants (grades, avatars)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and helpers (api-client, logger, authStore)
│   ├── pages/             # Page components for routing
│   ├── repositories/       # Data access layer (repository pattern)
│   ├── services/          # Service layer (business logic)
│   ├── test/              # Test utilities
│   └── utils/            # Helper functions
├── worker/                # Backend application
│   ├── __tests__/         # Worker tests
│   ├── middleware/         # Authentication, validation, rate limiting
│   ├── index.ts           # Worker entry point
│   ├── webhook-routes.ts   # Webhook API endpoints
│   ├── webhook-service.ts   # Webhook delivery service
│   └── entities.ts        # Durable Object entities
├── shared/                # Shared types and interfaces
├── docs/                 # Documentation (blueprint.md, task.md)
├── wiki/                 # GitHub Wiki documentation
├── public/               # Static assets
├── README.md             # Project overview
├── DOCUMENTATION.md      # Complete documentation
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── wrangler.jsonc       # Wrangler configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Frontend Architecture

### Components

The frontend uses a component-based architecture with shadcn/ui components as foundation. All components are built with React and TypeScript, following modern best practices.

Key component categories:
- Layout components (PortalLayout, PortalSidebar, SiteHeader)
- Form components (Input, Select, Button, Dialog)
- Data display components (Table, Card, Badge, EmptyState)
- Feedback components (Alert, Toast, Modal)
- Navigation components (Tabs, Breadcrumbs, Pagination)
- Animation components (FadeIn, SlideUp, SlideLeft, SlideRight)

### Layered Architecture

The frontend follows a clean, layered architecture with clear separation of concerns:

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

**Presentation Layer**: React components and pages that handle UI rendering and user interactions
**Custom Hooks Layer**: Domain-specific hooks that encapsulate data fetching logic with React Query
**Service Layer**: Business logic and API interaction abstraction following service contracts
**Repository Layer**: Clean abstraction over API client for testability
**API Client Layer**: Generic API client with error handling, caching, and resilience patterns

### Service Layer Pattern

The service layer provides a clean abstraction between UI and backend APIs:

- **Service Contracts**: TypeScript interfaces defining shape of each service (e.g., `StudentService`, `TeacherService`)
- **Service Implementations**: Concrete implementations that use repository pattern for data access
- **Custom Hooks**: React Query hooks that wrap service calls for automatic caching and loading states
- **Repository Pattern**: `IRepository` interface with `ApiRepository` implementation for testability

**Benefits**:
- Separates business logic from UI components
- Makes components easier to test by mocking repositories
- Provides a single point of maintenance for API endpoints
- Enables consistent error handling and data transformation
- Facilitates code reusability across components

**Example Usage**:
```typescript
// Custom hook wrapping service call
const { data, isLoading, error } = useStudentDashboard(studentId);

// Service implementation
export const studentService: StudentService = {
  async getDashboard(studentId: string): Promise<StudentDashboardData> {
    return repository.get<StudentDashboardData>(`/api/students/${studentId}/dashboard`);
  }
  // ... other methods
};

// With custom repository for testing
const mockRepo = new MockRepository();
const testStudentService = createStudentService(mockRepo);
```

### State Management

Zustand is used for state management, providing a simple and performant solution. The state is organized into domain-specific stores:

- `authStore`: Authentication and user session
- UI state is managed through React Query's built-in state management

### Routing

React Router v6 is used for client-side routing. Routes are organized by user role:

- Public routes: Landing page, login, news, about, contact
- Student routes: Dashboard, schedule, grades, student card
- Teacher routes: Dashboard, classes, grades, announcements
- Parent routes: Dashboard, child's schedule
- Admin routes: Dashboard, user management, announcements, settings

## Backend Architecture

### API Endpoints

The backend is built with Hono.js and runs on Cloudflare Workers. API endpoints follow RESTful conventions with comprehensive documentation available in `docs/blueprint.md`.

**Authentication**:
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

**Student Portal**:
- `GET /api/students/:id/dashboard` - Get student dashboard (schedule, grades, announcements)

**Teacher Portal**:
- `GET /api/teachers/:id/classes` - Get teacher's classes
- `GET /api/classes/:id/students` - Get students in a class with grades
- `POST /api/grades` - Create a new grade
- `PUT /api/grades/:id` - Update an existing grade

**Admin Portal**:
- `GET /api/users` - Get all users (with filtering)
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user (with referential integrity)

**Webhooks**:
- `GET /api/webhooks` - List webhook configurations
- `POST /api/webhooks` - Create webhook configuration
- `PUT /api/webhooks/:id` - Update webhook configuration
- `DELETE /api/webhooks/:id` - Delete webhook configuration
- `POST /api/webhooks/test` - Test webhook configuration
- `GET /api/webhooks/:id/deliveries` - Get webhook delivery history

For complete API documentation with request/response examples, see [docs/blueprint.md](./docs/blueprint.md).

### Authentication

Authentication is fully implemented using JWT (JSON Web Tokens) with role-based authorization:

1. User logs in with email, password, and role (student, teacher, parent, admin)
2. Server validates credentials and generates JWT token (24 hour expiration)
3. Client stores JWT token in localStorage
4. JWT is included in `Authorization: Bearer <token>` header for all subsequent requests
5. Server validates JWT on protected routes using `authenticate()` middleware
6. Role-based authorization is enforced using `authorize()` middleware

**Protected Routes**:
- Student portal: `/api/students/*` (requires `student` role)
- Teacher portal: `/api/teachers/*` and `/api/grades/*` (requires `teacher` role)
- Admin portal: `/api/users/*` and `/api/admin/*` (requires `admin` role)

For detailed authentication implementation, see [docs/blueprint.md](./docs/blueprint.md#authentication).

### Webhook System

The application includes a comprehensive webhook system for real-time notifications:

**Features**:
- Event-based triggers (grade created/updated, user created/updated/deleted, announcements)
- Queue system for reliable delivery
- Exponential backoff retry logic (1m, 5m, 15m, 30m, 1h, 2h)
- HMAC SHA-256 signature verification
- Webhook management API for CRUD operations
- Delivery history tracking
- Test endpoint for debugging

**Supported Events**:
- `grade.created` - New grade submitted
- `grade.updated` - Grade modified
- `user.created` - New user account created
- `user.updated` - User information updated
- `user.deleted` - User account deleted
- `announcement.created` - New announcement posted
- `announcement.updated` - Announcement modified

For complete webhook documentation, see [docs/blueprint.md](./docs/blueprint.md#webhook-management).

## Data Layer

Data is stored using Cloudflare Durable Objects, which provide:
- Strong consistency
- Low latency
- Global distribution
- Automatic scaling

Each entity type has its own Durable Object class with secondary indexes for efficient queries:
- `UserEntity` - User accounts and profiles (indexes: role, classId)
- `ClassEntity` - Class information (index: teacherId)
- `CourseEntity` - Course information (index: teacherId)
- `GradeEntity` - Student grades (indexes: studentId, courseId)
- `AnnouncementEntity` - School announcements (index: authorId)
- `ScheduleEntity` - Class schedules
- `WebhookConfigEntity` - Webhook configurations
- `WebhookEventEntity` - Webhook event queue
- `WebhookDeliveryEntity` - Webhook delivery tracking

For detailed data architecture and query optimization, see [docs/blueprint.md](./docs/blueprint.md#data-architecture).

## Resilience & Performance

The application implements multiple resilience patterns for reliability and performance:

### Resilience Patterns

**Circuit Breaker**:
- Threshold: 5 consecutive failures
- Timeout: 60 seconds
- Reset timeout: 30 seconds
- Prevents cascading failures and enables fast recovery

**Retry Logic**:
- Max retries: 3 (queries), 2 (mutations)
- Exponential backoff with jitter
- Non-retryable errors: 404, validation, auth errors

**Timeout Protection**:
- Default: 30 seconds (configurable)
- Applied on both client and server
- Prevents hanging requests

**Rate Limiting**:
- Standard: 100 requests / 15 minutes
- Strict: 50 requests / 5 minutes (seed, errors)
- Loose: 1000 requests / 1 hour
- Auth: 5 requests / 15 minutes

### Performance Optimizations

**Caching Strategy**:
- Intelligent caching with React Query
- Cache duration by data type (dynamic: 5min, semi-static: 30min-1h, static: 24h)
- 82% reduction in API calls per session
- Automatic cache invalidation on mutations

**Asset Optimization**:
- CSS animations instead of Framer Motion for simple transitions
- 4-5x faster page load performance
- Reduced JavaScript execution overhead

**Bundle Optimization**:
- Lazy loading of heavy libraries (PDF, charts)
- Code splitting with manual chunks
- 99%+ reduction in initial page load for affected pages

For detailed resilience patterns and monitoring, see [docs/blueprint.md](./docs/blueprint.md#resilience-patterns).

## Deployment

### Production Deployment

1. Build application:
    ```bash
    npm run build
    ```

2. Deploy to Cloudflare:
    ```bash
    npm run deploy
    ```

Alternatively, use the one-click deployment button in the README.

### Environment Variables

The following environment variables are available:

**Required for Production**:
- `JWT_SECRET`: Secret key for JWT signing (generate strong random string for production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://yourdomain.com`)

**Optional**:
- `VITE_LOG_LEVEL` / `LOG_LEVEL`: Logging level (debug, info, warn, error) - default: debug (dev), info (prod)
- `PORT`: Development server port (default: 3000)

**For Local Development**:
- Use defaults from `.env.example` - no changes required

### Health Monitoring

Health check endpoint available at `GET /api/health` for monitoring application status.

## Testing

The application uses Vitest for testing with comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests once (non-watch mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run linting
npm run lint
```

**Test Statistics** (as of 2026-01-30):
- Total tests: 2681 (2681 passing, 114 skipped, 155 todo)
- Test files: 88
- Coverage: Critical infrastructure, services, hooks, utilities, validation, domain services, rate limiting, query optimization

For detailed testing strategy, see [docs/task.md](./docs/task.md).

## Contributing

We welcome contributions to Akademia Pro! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Run tests (`npm run test:run`)
5. Run linting (`npm run lint`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.

**Code Style Guidelines**:
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex/non-obvious logic
- Write tests for new features
- Run tests and linting before committing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Developer onboarding, architecture patterns, component creation, testing, and contribution guidelines
- [API Blueprint](./docs/blueprint.md) - Complete API reference with endpoints, error codes, and integration patterns
- [Architectural Task List](./docs/task.md) - Implementation status and roadmap
- [User Guides](./wiki/User-Guides.md) - Instructions for students, teachers, parents, and admins
- [Security Assessment](./SECURITY_ASSESSMENT.md) - Comprehensive security audit results
- [Caching Optimization](./CACHING_OPTIMIZATION.md) - Performance optimization details
- [Security Implementation](./worker/SECURITY_IMPLEMENTATION.md) - Security features and best practices
- [GitHub Wiki](https://github.com/cpa01cmz-beep/web-sekolah/wiki) - Additional documentation and guides
