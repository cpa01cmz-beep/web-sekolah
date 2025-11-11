# iFlow Context for Akademia Pro

## Project Overview

Akademia Pro is a modern, all-in-one school management portal built with a focus on performance and user experience. It provides dedicated portals for students, teachers, parents, and administrators, all accessible through a single platform.

### Key Technologies

- **Frontend**: React, Vite, React Router, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, Recharts
- **Backend**: Hono.js on Cloudflare Workers
- **Data**: Cloudflare Durable Objects
- **Language**: TypeScript (end-to-end)
- **Package Manager**: Bun
- **Deployment**: Cloudflare Workers via Wrangler

### Architecture

The application follows a three-layer architecture:
1. **Frontend Layer**: React-based SPA served through Vite
2. **Backend Layer**: Hono.js API running on Cloudflare Workers
3. **Data Layer**: Cloudflare Durable Objects for stateful data storage

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │    Backend       │    │      Data          │
│   (React/Vite)  │◄──►│ (Hono/Workers)   │◄──►│ (Durable Objects)  │
└─────────────────┘    └──────────────────┘    └────────────────────┘
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
└── tests/                # Test files
```

## Building and Running

### Prerequisites

- Bun
- Wrangler CLI

### Development

To start the development server (runs both frontend and backend):

```bash
bun dev
```

The application will be available at `http://localhost:3000`.

### Building

To build the application for production:

```bash
bun run build
```

### Deployment

To deploy to Cloudflare:

```bash
bun deploy
```

Alternatively, you can deploy directly from your GitHub repository using the Cloudflare deploy button.

## Development Conventions

- **Routing**: Uses React Router v6 with lazy-loaded pages for code splitting
- **State Management**: Zustand for frontend state management
- **API Communication**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui components built on Radix UI and Tailwind CSS
- **Data Validation**: Zod for form and API response validation
- **Authentication**: JWT-based authentication with role-based access control
- **Error Handling**: Comprehensive error boundaries and centralized error reporting
- **Styling**: Tailwind CSS with a focus on utility-first styling
- **Animations**: Framer Motion for UI animations and transitions
- **Data Visualization**: Recharts for displaying charts and graphs
- **Code Quality**: ESLint with TypeScript ESLint plugin for linting

## Key Features

- Unified login portal for all user roles (Student, Teacher, Parent, Admin)
- Role-specific dashboards with relevant information
- Student portal with schedule, grades (RDM integration), digital ID, and announcements
- Teacher portal with class management, grade submission, and announcements
- Parent portal for monitoring child's academic progress
- Admin portal for user management and system configuration
- Responsive design that works on all device sizes
- Real-time data synchronization through Cloudflare Workers and Durable Objects