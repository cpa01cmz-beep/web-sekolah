# Deployment Guide

## Prerequisites

- Cloudflare account with Workers paid plan
- Domain configured in Cloudflare
- GitHub repository with the code
- Bun package manager installed

## Deployment Steps

### 1. Configure Wrangler

Ensure `wrangler.jsonc` is properly configured with your Cloudflare settings:

```json
{
  "name": "akademia-pro",
  "main": "worker/index.ts",
  "compatibility_date": "2023-10-01",
  "account_id": "your_account_id",
  "workers_dev": false,
  "route": {
    "pattern": "api.yourdomain.com/*",
    "zone_id": "your_zone_id"
  },
  "vars": {
    "NODE_ENV": "production"
  }
}
```

### 2. Set Environment Variables

Configure secrets in Cloudflare Workers:

```bash
wrangler secret put JWT_SECRET
wrangler secret put CLOUDFLARE_API_TOKEN
```

### 3. Build the Frontend

```bash
bun run build
```

### 4. Deploy the Worker

```bash
wrangler deploy
```

### 5. Deploy Static Assets

Upload the contents of the `dist` folder to your web hosting provider or Cloudflare Pages.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/deploy.yml`.

### Workflow Steps

1. Checkout code
2. Setup Bun environment
3. Install dependencies
4. Run tests
5. Build frontend
6. Deploy to Cloudflare Workers
7. Deploy static assets

## Environment Configuration

### Production Environment

Create a `.env.production` file with production-specific variables:

```
NODE_ENV=production
CLOUDFLARE_ACCOUNT_ID=your_production_account_id
```

### Staging Environment

Create a `.env.staging` file with staging-specific variables:

```
NODE_ENV=staging
CLOUDFLARE_ACCOUNT_ID=your_staging_account_id
```

## Monitoring and Logging

### Cloudflare Analytics

- Enable Workers analytics in the Cloudflare dashboard
- Monitor request volume, latency, and error rates
- Set up alerts for anomalies

### Custom Logging

- Implement structured logging in the worker
- Use a logging service like Logflare or Datadog
- Monitor for security events and errors

## Rollback Procedure

In case of deployment issues:

1. Identify the last stable deployment:
   ```bash
   wrangler versions list
   ```

2. Rollback to the previous version:
   ```bash
   wrangler versions deploy <version-id>
   ```

## Performance Optimization

### Caching Strategy

- Configure Cache-Control headers for static assets
- Use Cloudflare's CDN for global content delivery
- Implement browser caching for frontend resources

### Asset Optimization

- Minify CSS, JavaScript, and HTML
- Optimize images with WebP format
- Use code splitting for JavaScript bundles

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Verify Cloudflare API token permissions
   - Check account ID in wrangler.jsonc

2. **API endpoints return 404**
   - Verify route pattern in wrangler.jsonc
   - Check domain configuration in Cloudflare

3. **Frontend fails to load**
   - Verify static asset deployment
   - Check CORS configuration

### Debugging

- Use `wrangler dev` for local development and testing
- Check Cloudflare Workers logs in the dashboard
- Enable debug logging in the worker for detailed information