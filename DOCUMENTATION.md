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
6. [Data Layer](#data-layer)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Contributing](#contributing)
10. [License](#license)

## Introduction

Akademia Pro is a modern, all-in-one school management portal designed to streamline communication and information access for students, teachers, parents, and administrators. Built with cutting-edge technologies, it provides a seamless user experience across all devices while maintaining high performance and security standards.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh/) (package manager and runtime)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare Workers CLI)
- Node.js (for some development tools)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/akademia-pro.git
   ```

2. Navigate to the project directory:
   ```bash
   cd akademia-pro
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

### Development Setup

1. Start the development server:
   ```bash
   bun dev
   ```

2. The application will be available at `http://localhost:3000` (or the port specified in your environment).

3. For backend development, you can also run the worker separately:
   ```bash
   wrangler dev worker/index.ts
   ```

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
├── tests/                # Test files
├── README.md             # Project overview
├── ROADMAP.md            # Development roadmap
├── BLUEPRINT.md          # Technical blueprint
├── DOCUMENTATION.md      # Complete documentation
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── wrangler.jsonc        # Wrangler configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Frontend Architecture

### Components

The frontend uses a component-based architecture with shadcn/ui components as the foundation. All components are built with React and TypeScript, following modern best practices.

Key component categories:
- Layout components (Header, Sidebar, Footer)
- Form components (Input, Select, Button)
- Data display components (Table, Card, Badge)
- Feedback components (Alert, Toast, Modal)
- Navigation components (Tabs, Breadcrumbs, Pagination)

### State Management

Zustand is used for state management, providing a simple and performant solution. The state is organized into domain-specific stores:

- `authStore`: Authentication and user session
- `uiStore`: UI state (loading, modals, theme)
- `dataStore`: Application data (users, classes, grades)

### Routing

React Router v6 is used for client-side routing. Routes are organized by user role:

- Public routes: Landing page, login
- Student routes: Dashboard, schedule, grades
- Teacher routes: Class management, grade submission
- Parent routes: Progress tracking, communication
- Admin routes: User management, system configuration

## Backend Architecture

### API Endpoints

The backend is built with Hono.js and runs on Cloudflare Workers. API endpoints follow RESTful conventions:

Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

User Management:
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get specific user (admin only)

Role-specific endpoints are organized under `/api/student`, `/api/teacher`, `/api/parent`, and `/api/admin`.

### Authentication

Authentication is implemented with JWT tokens:
1. User logs in with email/password
2. Server validates credentials and generates JWT
3. Client stores JWT in localStorage
4. JWT is included in Authorization header for all subsequent requests
5. Server validates JWT on protected routes

## Data Layer

Data is stored using Cloudflare Durable Objects, which provide:
- Strong consistency
- Low latency
- Global distribution
- Automatic scaling

Each entity type has its own Durable Object class:
- `UserDO`: User accounts and profiles
- `ClassDO`: Class information and enrollment
- `GradeDO`: Student grades and assessments
- `AnnouncementDO`: School announcements

## Deployment

### Production Deployment

1. Build the application:
   ```bash
   bun run build
   ```

2. Deploy to Cloudflare:
   ```bash
   bun deploy
   ```

Alternatively, you can use the one-click deployment button in the README.

### Environment Variables

The following environment variables are required:
- `JWT_SECRET`: Secret key for JWT signing
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `CLOUDFLARE_API_TOKEN`: API token with Workers permissions

## Testing

### Frontend Testing

Frontend components are tested with React Testing Library:
```bash
bun test:frontend
```

### Backend Testing

Backend API endpoints are tested with Jest:
```bash
bun test:backend
```

### End-to-End Testing

E2E tests are implemented with Playwright:
```bash
bun test:e2e
```

## Contributing

We welcome contributions to Akademia Pro! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.

### iFlow Automation for Contributors

This repository uses iFlow CLI automation to streamline development workflows:

- **Issue Automation**: When you create an issue, iFlow can automatically implement solutions and open PRs
- **PR Review**: All pull requests are automatically reviewed for code quality, security, and performance
- **Documentation Updates**: Documentation is automatically updated when changes are merged to main
- **Maintenance**: Scheduled maintenance tasks help keep dependencies up-to-date and secure

You can also interact with iFlow directly:
- Comment `@iflow-cli /solve` on an issue to trigger automated implementation
- Comment `@iflow-cli /review` on a PR to request an additional review
- Comment `@iflow-cli /apply` on a PR to automatically apply review feedback

For OpenCode integration, you can use:
- Comment `/opencode` or `/oc` on any issue or PR to trigger AI-assisted development

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.