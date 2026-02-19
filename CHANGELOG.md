# Changelog

All notable changes to the Akademia Pro project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Ongoing security improvements and dependency updates

## [2026-01-07] - Security Hardening

### Added
- 🔒 Restrictive CORS Configuration with environment-based allowed origins
- 🛡️ Security Headers Middleware (HSTS, CSP, X-Frame-Options, etc.)
- 🔐 PBKDF2 Password Hashing with 100,000 iterations
- 👤 Role-based Access Control (RBAC) implementation
- 🚦 Rate Limiting protection

### Changed
- Replaced permissive `origin: '*'` with configurable `ALLOWED_ORIGINS`
- Enhanced authentication flow with stronger password requirements

### Security
- Hardened against CSRF attacks
- Added comprehensive security headers
- Implemented proper session management

## [2025-11-13] - Security Fixes

### Security
- **CVE-2025-59139**: Fixed medium severity vulnerability in Hono (bodyLimit middleware)
  - Updated `hono` from 4.8.5 to 4.10.5
- Updated `zod` from 4.0.5 to 4.1.12 for latest bug fixes
- Updated `jspdf` from 2.5.1 to 3.0.3 via `npm audit fix`

## [Earlier Versions]

### Security
- Initial security architecture
- Basic authentication implementation
- Input validation and sanitization
