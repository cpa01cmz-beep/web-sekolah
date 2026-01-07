# Technical Blueprint

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
- **Authentication**: JWT-based authentication

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
│   ├── assets/           # Static assets (images, icons, etc.)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components for routing
│   │   ├── portal/       # Role-specific portal pages
│   │   │   ├── admin/    # Admin portal pages
│   │   │   ├── parent/   # Parent portal pages
│   │   │   ├── student/  # Student portal pages
│   │   │   └── teacher/  # Teacher portal pages
│   │   └── public/       # Public pages (landing, login, etc.)
│   ├── services/         # Service modules for API communication
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite environment types
├── worker/               # Backend application
│   ├── core-utils.ts     # Core utilities and types
│   ├── entities.ts       # Durable Object entities
│   ├── index.ts          # Worker entry point
│   └── user-routes.ts    # User route handlers
├── shared/               # Shared types and interfaces
├── public/               # Static assets
└── wiki/                 # Project documentation
```

## Core Components

### 1. User Management
- User roles (student, teacher, parent, admin)
- User CRUD operations (admin only)

### 2. Academic Management
- Class management
- Course management
- Grade management

### 3. Data Management
- Durable Objects for each entity type (Users, Classes, Courses, Grades, etc.)
- Data seeding for initial setup

### 4. Communication System
- Announcement broadcasting

## API Design

### Health Endpoint
```
GET    /api/health             # Check API health status
```

### Seed Endpoint
```
POST   /api/seed               # Seed database with initial data
```

### Client Error Reporting
```
POST   /api/client-errors      # Report client-side errors
```

### Student Endpoints
```
GET    /api/students/:id/dashboard  # Get student dashboard data
```

### Teacher Endpoints
```
GET    /api/teachers/:id/classes    # Get teacher's assigned classes
GET    /api/classes/:id/students    # Get students in a class with grades
```

### Grade Endpoints
```
POST   /api/grades             # Create a new grade entry
PUT    /api/grades/:id         # Update an existing grade entry
```

### User Endpoints
```
GET    /api/users              # Get all users (admin only)
POST   /api/users              # Create a new user (admin only)
PUT    /api/users/:id          # Update an existing user (admin only)
DELETE /api/users/:id          # Delete a user (admin only)
```

## Data Models

### Base Types
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
```

### User
```typescript
interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

interface Student extends BaseUser {
  role: 'student';
  classId: string;
  studentIdNumber: string;
}

interface Teacher extends BaseUser {
  role: 'teacher';
  classIds: string[];
}

interface Parent extends BaseUser {
  role: 'parent';
  childId: string;
}

interface Admin extends BaseUser {
  role: 'admin';
}

type SchoolUser = Student | Teacher | Parent | Admin;
```

### School Entities
```typescript
interface SchoolClass {
  id: string;
  name: string; // e.g., "11-A"
  teacherId: string;
}

interface Course {
  id: string;
  name: string;
  teacherId: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  feedback: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601 format
  authorId: string;
}

interface ScheduleItem {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  time: string; // "07:30 - 09:00"
  courseId: string;
}
```

### API Response Types
```typescript
interface StudentDashboardData {
  schedule: (ScheduleItem & { courseName: string; teacherName: string })[];
  recentGrades: (Grade & { courseName: string })[];
  announcements: (Announcement & { authorName: string })[];
}

interface SchoolData {
  users: SchoolUser[];
  classes: SchoolClass[];
  courses: Course[];
  grades: Grade[];
  announcements: Announcement[];
  schedules: (ScheduleItem & { classId: string })[];
}
```

## Security Considerations

### Authentication & Authorization
- CORS configuration for API endpoints
- JWT token-based authentication for production
- Role-based access control (RBAC)
- Secure session management with HttpOnly cookies
- Rate limiting on authentication endpoints

### Data Protection
- HTTPS enforcement for all connections
- Input validation and sanitization
- Output encoding to prevent XSS
- SQL injection prevention through parameterized queries
- Sensitive data encryption at rest

### Infrastructure Security
- Cloudflare WAF with OWASP rules
- DDoS protection and rate limiting
- Secure headers configuration (CSP, HSTS, X-Frame-Options)
- Environment variable management for secrets
- Regular security audits and dependency updates

### Monitoring & Logging
- Security event logging
- Intrusion detection
- Audit trail for privileged operations

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
