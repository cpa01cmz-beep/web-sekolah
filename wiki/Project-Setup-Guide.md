# Project Setup Guide

This document outlines the steps to set up the Akademia Pro project based on the roadmap and blueprint.

## Prerequisites

- Node.js (version 18 or higher)
- npm package manager
- Cloudflare account
- GitHub account

## Initial Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd web-sekolah
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Cloudflare
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   
   # Authentication (currently using mock tokens)
   # JWT_SECRET=your_jwt_secret
   
   # Development
   NODE_ENV=development
   ```

## Development Workflow

### Frontend Development

1. Start the development server:
   ```
   bun dev
   ```

2. Access the application at `http://localhost:5173`

### Backend Development

The backend runs as part of the main development server. When you start the development server, both frontend and backend will be available.

## Project Structure Implementation

The actual project structure is as follows:

```
web-sekolah/
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

## Implementation Roadmap

Follow the phases outlined in the Development Roadmap:

1. **Phase 1**: Focus on core architecture and basic authentication
2. **Phase 2**: Develop user portals for each role
3. **Phase 3**: Implement advanced features
4. **Phase 4**: Conduct thorough testing
5. **Phase 5**: Deploy to production

## Best Practices

- Follow the established coding standards
- Write unit tests for new features
- Document significant changes in the wiki
- Use feature branches for development
- Create pull requests for code review
