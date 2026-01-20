# Akademia Pro

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cpa01cmz-beep/web-sekolah)

[![🤖 iFlow CLI Automation](https://img.shields.io/badge/iFlow--CLI-Automation-blue)](https://github.com/iflow-ai/iflow-cli-action)

[![Tests: 2079 passing](https://img.shields.io/badge/Tests-2079%20passing-brightgreen)](https://github.com/cpa01cmz-beep/web-sekolah/actions)
[![Security: 95/100](https://img.shields.io/badge/Security-95%2F100-success)](./docs/SECURITY_ASSESSMENT_2026-01-08.md)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, all-in-one school management portal for students, teachers, parents, and administrators, featuring a stunning user interface and seamless user experience.

## 🚀 Quick Start (5 Minutes)

```bash
# Clone and install
git clone https://github.com/cpa01cmz-beep/web-sekolah.git
cd web-sekolah
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:3000` → Visit `/api/seed` → Login with `student@example.com` / `password123`

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [iFlow CLI Automation](#iflow-cli-automation)
- [Project Structure](#project-structure)
- [License](#license)

## About The Project

Akademia Pro is a comprehensive, modern, and visually stunning school management system designed to streamline communication and information access for all stakeholders in the educational ecosystem. It provides dedicated, secure portals for students, teachers, parents, and administrators, all accessible through a single, intuitive platform.

The system is built on Cloudflare's high-performance serverless infrastructure, ensuring reliability, speed, and scalability. The user experience is paramount, with a focus on clean design, delightful micro-interactions, and flawless responsiveness across all devices.

## Key Features

- **Public Landing Page**: A professional, public-facing homepage serving as the school's digital front door.
- **Unified Login Portal**: A single, secure login page for all user roles (Student, Teacher, Parent, Admin) with role-based authentication.
- **Student Portal**: Personalized dashboard for viewing schedules, grades (with RDM data design), digital student card, and announcements.
- **Teacher Portal**: Dedicated workspace for managing classes, submitting grades, and posting announcements.
- **Parent Portal**: Overview for monitoring child's academic progress and communicating with teachers.
- **Admin Portal**: Comprehensive backend for user management and school-wide data oversight.

## Performance Metrics

- **Bundle Size**: 491 KB (136 KB gzipped) - 53% reduction from optimizations
- **Load Time**: < 2 seconds on 3G connection
- **API Response**: < 100ms average (Cloudflare Workers)
- **Security**: 95/100 score (Production Ready ✅)
- **Test Coverage**: 2079 tests passing (5 skipped, 155 todo)

## Technology Stack

- **Frontend**:
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [React Router](https://reactrouter.com/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Zustand](https://github.com/pmndrs/zustand) for state management
  - [CSS Animations](https://tailwindcss.com/docs/animation) for animations
  - [Recharts](https://recharts.org/) for data visualization
- **Backend**:
  - [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
- **Storage**:
  - [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- **Language**:
  - [TypeScript](https://www.typescriptlang.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have following installed:
- [Node.js](https://nodejs.org/) (recommended: v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/cpa01cmz-beep/web-sekolah.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd web-sekolah
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    
    Update the `.env` file with your configuration. For local development, the defaults in `.env.example` should work. For production deployment, ensure you update the `ALLOWED_ORIGINS` and `JWT_SECRET` values.

## Usage

To start the development server, which runs both the Vite frontend and the Hono backend on Cloudflare Workers simultaneously, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

### Quick Start

After starting the application:

1. **Seed the Database** (First Time Only):
   - Visit `http://localhost:3000`
   - Navigate to `/api/seed` in your browser or use:
     ```bash
     curl -X POST http://localhost:3000/api/seed
     ```
   - This creates sample users, classes, and courses

2. **Login to a Portal**:
   - On the login page, select your role (Student, Teacher, Parent, or Admin)
   - Enter your credentials:
     - **Email**: Use any of the seed user emails (e.g., `student@example.com`)
     - **Password**: `password123` (default for all seed users)
   - Click "Login" to access your role-specific portal

3. **Explore Your Portal**:
   - **Student Portal**: View your schedule, grades, student card, and announcements
   - **Teacher Portal**: Manage your classes, submit grades, and post announcements
   - **Parent Portal**: Monitor your child's academic progress
   - **Admin Portal**: Manage users and oversee school-wide data

### Example User Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | password123 |
| Teacher | teacher@example.com | password123 |
| Parent | parent@example.com | password123 |
| Admin | admin@example.com | password123 |

## Documentation

**📖 Essential Reading**
- [Quick Start Guide](./docs/QUICK_START.md) - 5-minute setup for each user role
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Architecture, component patterns, and testing
- [Testing Guide](./docs/TESTING_GUIDE.md) - Comprehensive testing patterns and strategies
- [API Blueprint](./docs/blueprint.md) - Complete API reference with 40+ endpoints

**🏗️ Architecture & Best Practices**
- [Integration Architecture](./docs/INTEGRATION_ARCHITECTURE.md) - Circuit breakers, retries, webhook reliability
- [State Management](./docs/STATE_MANAGEMENT.md) - Zustand and React Query patterns
- [Validation Guide](./docs/VALIDATION_GUIDE.md) - Input validation with Zod schemas

**🔒 Security**
- [Security Guide](./docs/SECURITY.md) - Security controls and deployment checklist
- [Security Assessment](./docs/SECURITY_ASSESSMENT_2026-01-08.md) - 95/100 score, production ready

**🚀 Deployment**
- [Deployment Guide](./docs/DEPLOYMENT.md) - CI/CD procedures, environments, and rollback

**🎨 UI/UX & Accessibility**
- [UI/UX Best Practices](./docs/UI_UX_BEST_PRACTICES.md) - WCAG AA compliance and design patterns
- [Color Contrast Verification](./docs/COLOR_CONTRAST_VERIFICATION.md) - Accessibility verification

**📊 Development & Roadmap**
- [Architectural Task List](./docs/task.md) - Implementation status and recent improvements

Full documentation available in the [docs/](./docs/) directory.

**Getting Started**
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Start here! Developer onboarding, architecture patterns, component creation, testing, and contribution guidelines
- [Quick Start Guide](./docs/QUICK_START.md) - Get started quickly with step-by-step guides for students, teachers, parents, and admins

**Architecture & API**
- [API Blueprint](./docs/blueprint.md) - Complete API reference with endpoints, error codes, and integration patterns
- [Integration Architecture](./docs/INTEGRATION_ARCHITECTURE.md) - Enterprise-grade resilience patterns, circuit breakers, retries, and webhook reliability
- [State Management](./docs/STATE_MANAGEMENT.md) - Zustand state management patterns and examples

**Security**
- [Security Guide](./docs/SECURITY.md) - Security controls, best practices, and deployment checklist
- [Security Assessment](./docs/SECURITY_ASSESSMENT_2026-01-08.md) - Current security status (95/100, Production Ready ✅)

**Development Guides**
- [Architectural Task List](./docs/task.md) - Implementation status and roadmap
- [Validation Guide](./docs/VALIDATION_GUIDE.md) - Input validation patterns with Zod schemas

**Accessibility & UI/UX**
- [UI/UX Best Practices](./docs/UI_UX_BEST_PRACTICES.md) - Accessibility (WCAG AA), keyboard shortcuts, design system patterns, and responsive design
- [Color Contrast Verification](./docs/COLOR_CONTRAST_VERIFICATION.md) - WCAG AA compliance verification for theme colors
- [Table Responsiveness Verification](./docs/TABLE_RESPONSIVENESS_VERIFICATION.md) - Table design patterns and responsive behavior

## Development

### Running Tests

Run the test suite to verify everything is working:

```bash
npm test
```

All tests should pass (currently 2079 tests passing, 5 skipped, 155 todo).

### Type Checking

Check TypeScript types:

```bash
npx tsc --noEmit
```

### Linting

Check code for linting errors:

```bash
npm run lint
```

### Building

Build the production bundle:

```bash
npm run build
```

## Troubleshooting

### Common Issues

**Problem**: Application won't start after `npm run dev`
- **Solution**: Check if port 3000 is already in use:
  ```bash
  lsof -ti:3000 | xargs kill  # macOS/Linux
  npx kill-port 3000              # Cross-platform
  ```
  Or change port in `.env`: `PORT=4000`

**Problem**: Seed data not appearing
- **Solution**: Ensure you've run `POST /api/seed`:
  ```bash
  curl -X POST http://localhost:3000/api/seed
  ```
  Check browser console (F12) for network errors.

**Problem**: Login fails with "Invalid credentials"
- **Solution**: Verify credentials from seed data:
  - Password: `password123` (all users)
  - Email: Check exact spelling from example table
  - Role: Must match user's assigned role

**Problem**: 404 errors on API endpoints
- **Solution**: Ensure backend worker is running:
  ```bash
  # Check if worker is running on port 3000
  curl http://localhost:3000/api/health
  # Verify Wrangler authentication
  wrangler whoami
  ```

**Problem**: CORS errors in browser console
- **Solution**: Update `ALLOWED_ORIGINS` in `.env`:
  ```
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
  ```
  Restart server after changing `.env`.

**Problem**: Tests failing
- **Solution**:
  ```bash
  # Clean install dependencies
  rm -rf node_modules package-lock.json
  npm install
  # Check Node.js version (requires v18+)
  node --version
  ```

**Problem**: Build fails with TypeScript errors
- **Solution**: Run type check first:
  ```bash
  npx tsc --noEmit
  ```
  Review reported errors and fix type mismatches.

### Debug Mode

Enable debug logging by setting environment variable:

```bash
LOG_LEVEL=debug npm run dev
```

This provides detailed logs for troubleshooting API requests, database operations, and authentication.

## Contributing

We welcome contributions! Please follow these guidelines:

**1. Setup Development Environment**
```bash
git clone https://github.com/cpa01cmz-beep/web-sekolah.git
cd web-sekolah
npm install
npm run dev
```

**2. Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

**3. Make Changes**
- Write code following [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- Add tests for new functionality (aim for 98% coverage)
- Run tests: `npm test`
- Check linting: `npm run lint`
- Type check: `npx tsc --noEmit`

**4. Commit Changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

**5. Push and Create PR**
```bash
git push origin feature/your-feature-name
# Open pull request on GitHub
```

**Contribution Guidelines**
- ✅ All tests passing (1303 tests)
- ✅ Zero linting errors
- ✅ TypeScript compilation successful
- ✅ Documentation updated for new features
- ✅ Follow existing code style and patterns
- ✅ Write clear commit messages (conventional commits preferred)

## Deployment

This project is configured for seamless deployment to Cloudflare.

1.  Log in to your Cloudflare account using Wrangler:
    ```bash
    wrangler login
    ```
2.  Run the deployment script:
    ```bash
    npm run deploy
    ```
This command will build the application and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cpa01cmz-beep/web-sekolah)

## iFlow CLI Automation

This repository is configured with iFlow CLI automation that helps streamline development workflows:

- **Issue Automation**: When issues are created, iFlow automatically implements solutions and opens PRs
- **PR Review**: Pull requests are automatically reviewed for code quality, security, and performance
- **Documentation Updates**: Documentation is automatically updated when changes are merged to main
- **Intelligent Repository Analysis**: Scheduled analysis of codebase, CI/CD patterns, and issue history to identify improvements and opportunities
- **Maintenance**: Scheduled maintenance tasks help keep dependencies up-to-date and secure

To learn more about iFlow CLI, visit [iflow.ai](https://iflow.ai).

## Project Structure

```
├── src/                          # Frontend React Application
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components (button, dialog, table, etc.)
│   │   ├── forms/               # Form components (UserForm, GradeForm, AnnouncementForm)
│   │   └── portal/              # Portal-specific components (PortalSidebar, PortalLayout)
│   ├── pages/                    # Page components for routing
│   │   ├── portal/              # Role-specific portal pages
│   │   │   ├── student/         # Student dashboard, grades, schedule, card
│   │   │   ├── teacher/         # Teacher dashboard, grade management, announcements
│   │   │   ├── parent/          # Parent dashboard, child monitoring
│   │   │   └── admin/           # Admin dashboard, user management, settings
│   │   └── ...                  # Public pages (Home, About, Contact, Login)
│   ├── hooks/                    # Custom React hooks for data fetching
│   ├── lib/                     # Utility libraries (api-client, resilience, auth)
│   ├── services/                 # Service layer for API abstraction
│   ├── stores/                   # Zustand global state stores
│   └── config/                  # Configuration files (time, caching, navigation)
│
├── worker/                       # Backend Hono Application (Cloudflare Workers)
│   ├── middleware/               # Expressive middleware (auth, validation, rate-limit, security)
│   ├── domain/                   # Domain services (business logic layer)
│   │   ├── UserService.ts
│   │   ├── GradeService.ts
│   │   ├── StudentDashboardService.ts
│   │   └── CommonDataService.ts  # Shared data access patterns
│   ├── storage/                  # Durable Objects storage abstractions
│   │   ├── Index.ts             # Primary index (ID-based lookups)
│   │   ├── SecondaryIndex.ts     # Field-based indexed lookups
│   │   ├── CompoundSecondaryIndex.ts
│   │   └── DateSortedSecondaryIndex.ts
│   ├── entities.ts               # Durable Object entities (data models)
│   ├── user-routes.ts            # User API routes (students, teachers, parents)
│   ├── auth-routes.ts            # Authentication routes (login, verify)
│   ├── webhook-routes.ts         # Webhook management routes
│   ├── index.ts                  # Worker entry point with middleware stack
│   ├── config/                   # Backend configuration (time, validation)
│   └── __tests__/               # Backend test suite (40+ test files)
│
├── shared/                       # Shared TypeScript types and interfaces
│   └── types.ts                 # Frontend + Backend type definitions
│
├── docs/                         # Comprehensive documentation
│   ├── blueprint.md              # Complete API reference (3000+ lines)
│   ├── DEVELOPER_GUIDE.md       # Developer onboarding guide
│   ├── QUICK_START.md           # Quick start for end users
│   ├── task.md                 # Architectural implementation status
│   └── ...                     # Additional guides (security, validation, UI/UX)
│
└── public/                       # Static assets
```

**Key Architectural Patterns**
- **Frontend**: React Query for server state, Zustand for global state, local state for UI
- **Backend**: Clean layered architecture (routes → services → entities → storage)
- **Data**: Durable Objects with primary and secondary indexes for O(1) lookups
- **Security**: PBKDF2 password hashing, JWT authentication, rate limiting, CSP headers
- **Performance**: 53% bundle size reduction, indexed queries (zero table scans)

## License

Distributed under the MIT License. See `LICENSE` for more information.