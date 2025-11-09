# Project Setup Guide

This document outlines the steps to set up the Akademia Pro project based on the roadmap and blueprint.

## Prerequisites

- Node.js (version 18 or higher)
- Bun package manager
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
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Cloudflare
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   
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

1. Start the worker in development mode:
   ```
   bun run worker:dev
   ```

2. Access the API at `http://localhost:8787`

## Project Structure Implementation

Based on the blueprint, ensure the following directory structure is maintained:

```
web-sekolah/
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