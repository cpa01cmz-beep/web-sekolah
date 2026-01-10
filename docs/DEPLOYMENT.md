# Deployment Guide - Akademia Pro

Complete guide for deploying Akademia Pro to Cloudflare Workers using GitHub Actions CI/CD.

## Overview

Akademia Pro uses a fully automated CI/CD pipeline with Cloudflare Workers. The deployment process includes:

- **Automated staging deployments** on main branch pushes
- **Manual production deployments** with approval workflow
- **Health checks** after each deployment
- **Rollback capability** for failed deployments
- **Environment separation** (staging, production)

## Prerequisites

### Local Development

- Node.js v18 or later
- npm (comes with Node.js)
- Wrangler CLI installed globally: `npm install -g wrangler`

### Cloudflare Account

- Cloudflare account with Workers enabled
- API Token with Workers permissions
- Durable Objects enabled

## Environments

| Environment | Name | Purpose | Auto-Deploy |
|-------------|------|---------|-------------|
| Staging | website-sekolah-staging | Testing environment | Yes (main branch) |
| Production | website-sekolah-production | Live production | Manual approval only |

### Environment Variables

| Variable | Staging | Production | Description |
|----------|---------|------------|-------------|
| `ENVIRONMENT` | `staging` | `production` | Current environment |
| `JWT_SECRET` | `STAGING_JWT_SECRET` | `JWT_SECRET` | JWT signing secret (min 64 chars) |
| `CLOUDFLARE_ACCOUNT_ID` | Shared | Shared | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Shared | Shared | Cloudflare API token |

## Setup Instructions

### 1. Configure GitHub Secrets

Navigate to **Settings → Secrets and variables → Actions** in your GitHub repository and add the following secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | Dashboard → Workers & Pages → Overview |
| `CLOUDFLARE_API_TOKEN` | API Token with Workers permissions | Dashboard → My Profile → API Tokens → Create Token |
| `JWT_SECRET` | Production JWT signing secret | Generate a secure random string (64+ characters) |
| `STAGING_JWT_SECRET` | Staging JWT signing secret | Generate a secure random string (64+ characters) |

**Important**: Never commit secrets to the repository. Use environment-specific secrets for staging and production.

### 2. Configure Wrangler

Install Wrangler CLI:

```bash
npm install -g wrangler
```

Authenticate with Cloudflare:

```bash
wrangler login
```

The `wrangler.toml` file is already configured with staging and production environments.

## Deployment Process

### Automatic Staging Deployment

Staging deployments are automatically triggered when:
- Code is pushed to the `main` branch
- A pull request is merged to `main`

**Workflow**: `.github/workflows/deploy.yml`

**Steps executed**:
1. Checkout code
2. Setup Node.js v20
3. Install dependencies (`npm ci`)
4. Run tests (`npm run test:run`)
5. Run typecheck (`npm run typecheck`)
6. Run lint (`npm run lint`)
7. Build application (`npm run build`)
8. Deploy to staging (`npx wrangler deploy --env staging`)
9. Health check (5 retries, 10s intervals)
10. Create deployment status badge

### Manual Production Deployment

Production deployments require manual approval:

1. Go to **Actions** tab in GitHub
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Select environment: `production`
6. Click **Run workflow**

**Production deployment steps**:
1. All pre-deployment checks (tests, typecheck, lint, build)
2. Backup current deployment state
3. Deploy to production (`npx wrangler deploy --env production`)
4. Health check (5 retries, 10s intervals)
5. Rollback on health check failure

### Local Deployment

To deploy locally without CI/CD:

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

Or using Wrangler directly:

```bash
# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

## Health Checks

After each deployment, the CI/CD pipeline performs health checks:

- **Endpoint**: `/api/health`
- **Expected status**: `200` or `404` (endpoint may not exist)
- **Retries**: 5 attempts
- **Interval**: 10 seconds between retries

If health checks fail:
- Production deployment automatically initiates rollback
- Deployment status badge shows failure
- GitHub Actions workflow fails

## Rollback Procedures

### Automatic Rollback

Production deployments include automatic rollback on health check failure:

```bash
# Automatic rollback triggers when:
# 1. Health check fails after 5 retries
# 2. Workflow step fails
# 3. Timeout occurs
```

### Manual Rollback

To manually rollback to a previous deployment:

```bash
# List recent deployments
wrangler deployment list --env production

# Rollback to specific deployment
wrangler rollback --env production --deployment-id <deployment-id>
```

Use the deployment ID from the `deployment list` output.

### Rollback Script

The project includes a rollback script at `scripts/rollback.sh`:

```bash
./scripts/rollback.sh
```

This script:
- Lists recent deployments
- Prompts for deployment selection
- Creates backup before rollback
- Executes rollback with confirmation

## Monitoring and Observability

### Deployment Status Badges

Deployment status is automatically tracked with GitHub commit statuses:

- `deployment/staging` - Staging deployment status
- `deployment/production` - Production deployment status

View status badges on commit SHA or in GitHub Actions runs.

### Cloudflare Analytics

Monitor deployment performance:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker (website-sekolah-staging or website-sekolah-production)
3. View metrics: requests, errors, latency, CPU usage

### Health Endpoint

Monitor health status:

```bash
# Staging
curl https://website-sekolah-staging.<account>.workers.dev/api/health

# Production
curl https://website-sekolah-production.<account>.workers.dev/api/health
```

Replace `<account>` with your Cloudflare account ID.

## Troubleshooting

### Deployment Fails with "wrangler: command not found"

**Problem**: Wrangler CLI not available in CI/CD environment

**Solution**: Already fixed - `wrangler` is in `devDependencies` and workflow uses `npx wrangler deploy`

### Health Check Fails

**Problem**: Health check endpoint not responding correctly

**Solutions**:
1. Check worker logs: `wrangler tail --env staging`
2. Verify `/api/health` endpoint exists
3. Check for runtime errors in Cloudflare dashboard
4. Increase retries in `.github/workflows/deploy.yml`

### Environment Variables Missing

**Problem**: Secrets not configured in GitHub

**Solution**:
1. Go to repository Settings → Secrets and variables → Actions
2. Add missing secrets (see Setup Instructions)
3. Re-run failed workflow

### Authentication Failed

**Problem**: Cloudflare API token invalid or expired

**Solution**:
1. Regenerate API token in Cloudflare dashboard
2. Update `CLOUDFLARE_API_TOKEN` secret in GitHub
3. Re-run failed workflow

### Rollback Fails

**Problem**: Cannot rollback to previous deployment

**Solutions**:
1. List available deployments: `wrangler deployment list --env production`
2. Verify deployment ID exists
3. Manually redeploy previous commit: `git checkout <commit> && git push origin main`

## Best Practices

### Security

- Always use unique secrets for staging and production
- Rotate secrets quarterly or after any suspected compromise
- Use `ALLOWED_ORIGINS` environment variable in production
- Review security assessment report: `docs/SECURITY_ASSESSMENT_2026-01-10.md`

### Testing

- Run tests locally before pushing: `npm run test:run`
- Verify type checking: `npm run typecheck`
- Check linting: `npm run lint`
- Test on staging before production deployment

### Deployment Strategy

1. Deploy to staging on main branch push
2. Verify staging environment functionality
3. Manually approve production deployment
4. Monitor production health after deployment
5. Have rollback plan ready

### Monitoring

- Check Cloudflare dashboard for error rates
- Monitor health endpoint regularly
- Set up alerts for deployment failures
- Review deployment logs in GitHub Actions

## Workflow Files

### `.github/workflows/deploy.yml`

Main deployment workflow with:
- Staging deployment (automatic)
- Production deployment (manual approval)
- Pre-deployment checks (tests, typecheck, lint, build)
- Health checks with retries
- Rollback on failure

### `wrangler.toml`

Configuration for:
- Durable Objects bindings
- Environment-specific settings
- Staging and production environments
- Compatibility settings

## Additional Resources

- **Wrangler Documentation**: https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Security Guide**: [SECURITY.md](./SECURITY.md)
- **API Blueprint**: [blueprint.md](./blueprint.md)

## Support

For deployment issues:
1. Check this troubleshooting section
2. Review GitHub Actions logs
3. Check Cloudflare dashboard
4. Create GitHub issue with error details
