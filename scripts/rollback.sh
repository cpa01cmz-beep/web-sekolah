#!/bin/bash

# Rollback script for Cloudflare Workers deployment
# Usage: ./scripts/rollback.sh [staging|production]

set -e

ENVIRONMENT=${1:-"production"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ROLLBACK_TAG="rollback_${TIMESTAMP}"
BACKUP_DIR="/tmp/wrangler_backups"
BACKUP_FILE="${BACKUP_DIR}/${ENVIRONMENT}_deployment_backup.txt"

echo "🔄 Starting rollback to ${ENVIRONMENT}..."
echo "📝 Rollback tag: ${ROLLBACK_TAG}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Get current deployment information
echo "📊 Fetching current deployment information..."
wrangler deployment list --env "${ENVIRONMENT}" > "${BACKUP_FILE}"

# Get the most recent stable deployment
DEPLOYMENT_ID=$(wrangler deployment list --env "${ENVIRONMENT}" --limit 2 | tail -n 1 | grep -oE '[a-f0-9]{32}' | head -1)

if [ -z "${DEPLOYMENT_ID}" ]; then
  echo "❌ Error: Could not find a previous deployment to rollback to"
  exit 1
fi

echo "🎯 Rolling back to deployment: ${DEPLOYMENT_ID}"

# Confirm rollback
read -p "Are you sure you want to rollback ${ENVIRONMENT} to ${DEPLOYMENT_ID}? (yes/no): " confirm
if [ "${confirm}" != "yes" ]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

# Perform rollback
echo "🚀 Performing rollback..."
wrangler rollback --env "${ENVIRONMENT}" --deployment-id "${DEPLOYMENT_ID}"

# Health check after rollback
echo "🏥 Running health check after rollback..."
max_retries=5
retry_count=0

if [ "${ENVIRONMENT}" == "production" ]; then
  BASE_URL="https://your-domain.workers.dev"
else
  BASE_URL="https://staging.your-domain.workers.dev"
fi

while [ $retry_count -lt $max_retries ]; do
  echo "Health check attempt $((retry_count + 1)) of $max_retries"
  
  if curl -f -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" | grep -q "200\|404"; then
    echo "✅ Health check passed after rollback"
    echo "✅ Rollback completed successfully!"
    echo "📋 Deployment backup saved to: ${BACKUP_FILE}"
    exit 0
  fi
  
  retry_count=$((retry_count + 1))
  echo "Health check failed, retrying in 10 seconds..."
  sleep 10
done

echo "❌ Health check failed after rollback"
echo "⚠️  Deployment may be unstable. Manual intervention required."
exit 1
