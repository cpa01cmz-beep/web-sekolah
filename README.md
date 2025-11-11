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
  - [Framer Motion](https://www.framer.com/motion/) for animations
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

Make sure you have the following installed:
- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/akademia-pro.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd akademia-pro
    ```
3.  Install dependencies:
    ```bash
    bun install
    ```

## Usage

To start the development server, which runs both the Vite frontend and the Hono backend on Cloudflare Workers simultaneously, run:

```bash
bun dev
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

## Documentation

Comprehensive documentation is available in our [wiki](../../wiki/Home):

- [Home](../../wiki/Home) - Main documentation hub
- [Technical Blueprint](../../wiki/Technical-Blueprint) - Detailed technical documentation
- [Development Roadmap](../../wiki/Development-Roadmap) - Project development roadmap
- [API Documentation](../../wiki/API-Documentation) - API endpoints and usage
- [User Guides](../../wiki/User-Guides) - Instructions for using the application
- [Deployment Guide](../../wiki/Deployment-Guide) - Instructions for deploying the application
- [Security Guidelines](../../wiki/Security-Guidelines) - Security best practices and guidelines
- [Contributing](../../wiki/Contributing) - Guidelines for contributing to the project

## Deployment

This project is configured for seamless deployment to Cloudflare.

1.  Log in to your Cloudflare account using Wrangler:
    ```bash
    wrangler login
    ```
2.  Run the deployment script:
    ```bash
    bun deploy
    ```
This command will build the application and deploy it to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cpa01cmz-beep/web-sekolah)

## iFlow CLI Automation

This repository is configured with iFlow CLI automation that helps streamline development workflows:

- **Issue Automation**: When issues are created, iFlow automatically implements solutions and opens PRs
- **PR Review**: Pull requests are automatically reviewed for code quality, security, and performance
- **Documentation Updates**: Documentation is automatically updated when changes are merged to main
- **Maintenance**: Scheduled maintenance tasks help keep dependencies up-to-date and secure

To learn more about iFlow CLI, visit [iflow.ai](https://iflow.ai).

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers, including API routes and business logic.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend to ensure type safety.

## License

Distributed under the MIT License. See `LICENSE` for more information.