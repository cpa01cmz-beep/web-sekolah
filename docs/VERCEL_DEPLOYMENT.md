# Vercel Deployment Guide

Deploy Akademia Pro frontend to Vercel while using Cloudflare Workers for the backend API.

## Overview

This guide covers deploying the Vite React frontend to Vercel with the backend API running on Cloudflare Workers. This hybrid deployment approach provides:

- **Vercel**: Serves the static frontend with global CDN and optimal performance
- **Cloudflare Workers**: Handles API requests with Durable Objects for data storage

## Architecture

```
┌─────────────────┐       ┌──────────────────────┐
│   Vercel CDN    │       │  Cloudflare Workers  │
│   (Frontend)    │──────▶│   (Backend API)      │
│   Static Files  │  API  │   Durable Objects    │
└─────────────────┘       └──────────────────────┘
```

## Vercel Configuration Features

The `vercel.json` includes best-practice configurations:

| Feature | Description |
|---------|-------------|
| **Edge Regions** | Deployed to Singapore (sin1), Tokyo (hnd1), and US East (iad1) |
| **Image Optimization** | AVIF/WebP with 60s minimum cache TTL |
| **Security Headers** | CSP, XSS Protection, Frame Options, Permissions Policy |
| **Caching** | 1-year immutable cache for JS/CSS/assets with Expires headers |
| **SPA Routing** | Client-side routing with index.html fallback |
| **Ignore Command** | Skips builds for documentation-only changes (md files, docs/, wiki/, etc.) |
| **API Rewrite Caching** | Enabled caching for proxied API requests to Cloudflare Workers |
| **Serverless Functions** | Configured with 1024MB memory and 10s max duration for API routes |

## Prerequisites

- Vercel account
- Cloudflare account with Workers enabled
- GitHub repository connected to Vercel

## Deployment Steps

### 1. Deploy Backend to Cloudflare Workers

First, deploy the backend API to Cloudflare Workers:

```bash
npm run deploy:production
```

Note your Workers URL (e.g., `https://website-sekolah-production.your-account.workers.dev`)

### 2. Configure Vercel Project

1. Import your GitHub repository in Vercel
2. Configure the following settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

### 3. Configure Environment Variables

Add the following environment variables in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Cloudflare Workers API URL | `https://website-sekolah-production.account.workers.dev` |
| `VITE_ENVIRONMENT` | Environment name | `production` |
| `VITE_ALLOWED_ORIGINS` | Allowed CORS origins | `https://your-app.vercel.app` |

### 4. Configure API Rewrites

The `vercel.json` file is pre-configured to proxy API requests:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://website-sekolah-production.:account.workers.dev/api/:path*"
    }
  ]
}
```

Replace `:account` with your Cloudflare account ID or update the destination URL.

### 5. Deploy to Vercel

Push to the main branch or manually trigger deployment:

```bash
git push origin main
```

Or use Vercel CLI:

```bash
vercel --prod
```

## Configuration Details

### vercel.json

The `vercel.json` file contains:

- **Build settings**: Framework detection and output directory
- **Regions**: Edge deployment regions for optimal latency
- **Images**: Image optimization configuration
- **Rewrites**: API proxy configuration and SPA routing
- **Headers**: Security headers and caching policies

### .vercelignore

The `.vercelignore` file excludes unnecessary files from deployment:

- `worker/` - Backend code (deployed separately to Cloudflare)
- `wrangler.*` - Cloudflare configuration
- `*.test.ts` - Test files
- `__tests__/` - Test directories
- `.github/` - GitHub workflows
- Documentation files (wiki, prompts, changelogs)

This reduces deployment size and improves build times.

### Security Headers

Default security headers configured:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()` |
| `Content-Security-Policy` | Restrictive policy for scripts, styles, images, and connections |

### Caching Strategy

| Asset Type | Cache Duration |
|------------|----------------|
| JS/CSS bundles | 1 year (immutable) |
| Static assets | 1 year (immutable) |
| Fonts (.woff2) | 1 year (immutable) |
| HTML (index.html) | No cache (must-revalidate) |

### Edge Regions

The frontend is deployed to multiple edge regions for optimal global performance:

| Region | Code | Coverage |
|--------|------|----------|
| Singapore | sin1 | Southeast Asia, Oceania |
| Tokyo | hnd1 | East Asia |
| US East |iad1 | Americas |

### Image Optimization

Vercel Image Optimization is configured with:

- **Formats**: AVIF (preferred), WebP (fallback)
- **Remote Patterns**: All HTTPS sources allowed
- **Minimum Cache TTL**: 60 seconds

To use optimized images in components:

```tsx
<img 
  src="/images/photo.jpg" 
  alt="Description"
  loading="lazy"
/>
```

## Environment-Specific Configuration

### Preview Deployments

Preview deployments (pull requests) automatically use staging API:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://website-sekolah-staging.account.workers.dev/api/:path*"
    }
  ]
}
```

Configure this in Vercel's preview deployment settings.

### Production Deployments

Production deployments use the production API endpoint.

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings:
1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. View metrics in Vercel dashboard

### Error Tracking

Configure error tracking with:
- Vercel's built-in error monitoring
- Third-party services (Sentry, LogRocket)

## Troubleshooting

### API Requests Failing

**Problem**: API requests return 404 or CORS errors

**Solutions**:
1. Verify `vercel.json` rewrites point to correct Workers URL
2. Check `ALLOWED_ORIGINS` in Cloudflare Workers includes Vercel domain
3. Verify Workers deployment is active

### Build Fails

**Problem**: Vercel build fails

**Solutions**:
1. Check Node.js version (requires v18+)
2. Verify all dependencies are in `package.json`
3. Check build logs for specific errors

### SPA Routing Issues

**Problem**: Page refresh shows 404

**Solutions**:
1. Verify rewrite rule for SPA fallback
2. Check `vercel.json` rewrites configuration
3. Ensure `trailingSlash: false` is set

## Best Practices

### Performance

- Enable Vercel's Edge Network
- Use Image Optimization for images
- Configure proper cache headers

### Security

- Keep environment variables secure
- Use HTTPS for all API requests
- Configure CSP headers if needed

### CI/CD

- Run tests before deployment
- Use preview deployments for PRs
- Configure deployment protection

## Cost Optimization

### Vercel Pricing

- Hobby: Free for personal projects
- Pro: $20/month per member
- Enterprise: Custom pricing

### Cloudflare Workers

- Free tier: 100,000 requests/day
- Paid: $5/month for 10 million requests

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Cloudflare Workers deployment
- [Security Guide](./SECURITY.md) - Security best practices
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development workflows
