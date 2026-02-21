# Deployment Guide

## Prerequisites

- Cloudflare account with Workers enabled
- Domain configured in Cloudflare (optional for workers.dev)
- GitHub repository with the code
- Node.js v18+ and npm installed
- Wrangler CLI installed globally

## Deployment Steps

### 1. Configure Wrangler

Ensure `wrangler.toml` is properly configured with your Cloudflare settings:

```toml
name = "website-sekolah"
main = "worker/index.ts"
compatibility_date = "2026-02-18"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "dist/client"
not_found_handling = "single-page-application"
run_worker_first = ["/api/*", "!/api/docs/*"]
```

### 2. Set Environment Variables

In production, configure secrets in Cloudflare Workers or via wrangler:

```bash
# Set production secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put CLOUDFLARE_API_TOKEN --env production
```

Or configure via GitHub Actions secrets for CI/CD deployment:
- `JWT_SECRET` - Production JWT signing secret
- `STAGING_JWT_SECRET` - Staging JWT signing secret
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - API token with Workers permissions

### 3. Build the Application

```bash
npm run build
```

### 4. Deploy the Worker

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

Or use wrangler directly:

```bash
# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/deploy.yml`.

### Automated Deployment

- **Staging**: Automatic deployment on push to `main` branch
- **Production**: Manual deployment via workflow dispatch with approval

### Workflow Steps

1. Checkout code
2. Setup Node.js environment
3. Install dependencies (`npm ci`)
4. Run tests (`npm run test:run`)
5. Run type check (`npm run typecheck`)
6. Run lint (`npm run lint`)
7. Build application (`npm run build`)
8. Deploy to target environment
9. Health check verification

### Health Check

After each deployment, a health check is performed:
- Endpoint: `/api/health`
- Expected status: `200` or `404`
- Retries: 5 attempts with 10s intervals

## Environment Configuration

### Production Environment

Environment-specific configuration in `wrangler.toml`:

```toml
[env.production]
name = "website-sekolah-production"
workers_dev = false
keep_vars = true
vars = { ENVIRONMENT = "production" }
logpush = true
```

### Staging Environment

```toml
[env.staging]
name = "website-sekolah-staging"
vars = { ENVIRONMENT = "staging" }
```

## Monitoring and Logging

### Cloudflare Analytics

- Enable Workers analytics in the Cloudflare dashboard
- Monitor request volume, latency, and error rates
- Set up alerts for anomalies

### Observability

The project has observability enabled:

```toml
[observability]
enabled = true
head_sampling_rate = 0.1
```

### Health Endpoints

Monitor deployment health:

```bash
# Staging
curl https://website-sekolah-staging.<account>.workers.dev/api/health

# Production
curl https://website-sekolah-production.<account>.workers.dev/api/health
```

## Rollback Procedure

### Using Rollback Script

```bash
# Interactive rollback
./scripts/rollback.sh production

# Non-interactive (for CI/CD)
./scripts/rollback.sh staging --non-interactive
```

### Manual Rollback

```bash
# List recent deployments
wrangler deployment list --env production

# Rollback to specific deployment
wrangler rollback --env production
```

## Deployment Scripts

The project includes helper scripts in `scripts/`:

| Script | Purpose |
|--------|---------|
| `health-check.sh` | Verify deployment health |
| `pre-deploy-check.sh` | Run pre-deployment validation |
| `rollback.sh` | Rollback to previous deployment |
| `deployment-status.sh` | Check deployment status |
| `validate-env.sh` | Validate environment configuration |

### Example Usage

```bash
# Pre-deployment checks
npm run predeploy:staging

# Check deployment health
npm run health:staging -- --json

# Validate environment
npm run validate:env:production

# Check deployment status
npm run status:production -- --json
```

## Performance Optimization

### Caching Strategy

- Static assets served via Cloudflare's CDN
- Cache-Control headers configured for optimal caching
- SPA routing with worker-first API handling

### Build Optimization

- Vite for fast builds and optimized bundles
- Tree-shaking for unused code elimination
- Code splitting for efficient loading

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication error**
   - Verify Cloudflare API token permissions
   - Check `CLOUDFLARE_ACCOUNT_ID` in GitHub secrets
   - Ensure `CLOUDFLARE_API_TOKEN` has Workers deployment permissions

2. **API endpoints return 404**
   - Verify worker is deployed correctly
   - Check routing configuration in `wrangler.toml`
   - Ensure `run_worker_first` includes `/api/*`

3. **Health check fails after deployment**
   - Check worker logs: `wrangler tail --env staging`
   - Verify `/api/health` endpoint is accessible
   - Check for runtime errors in Cloudflare dashboard

4. **Build fails with TypeScript errors**
   - Run `npm run typecheck` locally first
   - Fix any type errors before deploying
   - Ensure all dependencies are installed

### Debugging

- Use `wrangler dev` for local development and testing
- Check Cloudflare Workers logs in the dashboard
- Enable verbose logging in deployment scripts: `--verbose`
- Monitor with `wrangler tail --env staging`
