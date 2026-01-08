# Akademia Pro

A modern, all-in-one school management portal for students, teachers, parents, and administrators, featuring a stunning user interface and seamless user experience.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cpa01cmz-beep/web-sekolah)

[![🤖 iFlow CLI Automation](https://img.shields.io/badge/iFlow--CLI-Automation-blue)](https://github.com/iflow-ai/iflow-cli-action)

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
- **Unified Login Portal**: A single, secure login page for all user roles (Student, Teacher, Parent, Admin) with role-specific authentication.
- **Student Portal**: A personalized dashboard for students to view their class schedule, check grades (with UI designed for RDM data), access their digital student card, and receive announcements.
- **Teacher Portal**: A dedicated workspace for teachers to manage their classes, submit grades, and post announcements.
- **Parent Portal**: An overview for parents to monitor their child's academic progress and communicate with teachers.
- **Admin Portal**: A comprehensive backend for administrators to manage users and oversee school-wide data.

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

Comprehensive documentation is available in our [docs/](./docs/) directory:

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

All tests should pass (currently 983 tests, 2 skipped).

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
- **Solution**: Check if port 3000 is already in use. Stop other services or change port in `.env`

**Problem**: Seed data not appearing
- **Solution**: Ensure you've run `POST /api/seed` at least once. Check browser console for errors

**Problem**: Login fails with "Invalid credentials"
- **Solution**: Verify password is `password123` (default). Check that you're using correct email from seed data

**Problem**: 404 errors on API endpoints
- **Solution**: Ensure backend worker is running. Check Wrangler authentication: `wrangler login`

**Problem**: CORS errors in browser console
- **Solution**: Add your local origin to `ALLOWED_ORIGINS` in `.env` file

**Problem**: Tests failing
- **Solution**: Ensure all dependencies installed: `npm install`. Check Node.js version compatibility

### Debug Mode

Enable debug logging by setting environment variable:

```bash
LOG_LEVEL=debug npm run dev
```

This provides detailed logs for troubleshooting API requests, database operations, and authentication.

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

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers, including API routes and business logic.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend to ensure type safety.

## License

Distributed under the MIT License. See `LICENSE` for more information.