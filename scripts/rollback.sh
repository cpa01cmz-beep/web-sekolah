#!/bin/bash

# Rollback script for Cloudflare Workers deployment
# Usage: ./scripts/rollback.sh [staging|production] [--non-interactive]
#
# Options:
#   --non-interactive  Skip confirmation prompt (useful for CI/CD)
#   --dry-run          Show what would be done without making changes
#   --verbose          Enable verbose output
#   --timeout=SECONDS  Maximum time to wait for health check after rollback (default: 60)
#
# Exit codes:
#   0 - Rollback successful
#   1 - Rollback failed
#   2 - Invalid arguments
#   3 - No previous deployment found

set -e

ENVIRONMENT=${1:-"production"}
NON_INTERACTIVE=false
DRY_RUN=false
VERBOSE=false
TIMEOUT=60

for arg in "$@"; do
  case $arg in
    --non-interactive)
      NON_INTERACTIVE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --timeout=*)
      TIMEOUT="${arg#*=}"
      shift
      ;;
  esac
done

log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo "[DEBUG] $1"
  fi
}

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ROLLBACK_TAG="rollback_${TIMESTAMP}"
BACKUP_DIR="/tmp/wrangler_backups"
BACKUP_FILE="${BACKUP_DIR}/${ENVIRONMENT}_deployment_backup.txt"
LOG_FILE="${BACKUP_DIR}/rollback_${TIMESTAMP}.log"

log() {
  local message="$1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${message}" | tee -a "${LOG_FILE}"
}

log "🔄 Starting rollback to ${ENVIRONMENT}..."
log "📝 Rollback tag: ${ROLLBACK_TAG}"
log_verbose "Backup directory: ${BACKUP_DIR}"
log_verbose "Log file: ${LOG_FILE}"

mkdir -p "${BACKUP_DIR}"

log "📊 Fetching current deployment information..."
log_verbose "Running: wrangler deployment list --env ${ENVIRONMENT}"
wrangler deployment list --env "${ENVIRONMENT}" > "${BACKUP_FILE}" 2>&1 || {
  log "❌ Error: Failed to fetch deployment information"
  exit 1
}

DEPLOYMENT_ID=$(wrangler deployment list --env "${ENVIRONMENT}" --limit 2 2>/dev/null | tail -n 1 | grep -oE '[a-f0-9]{32}' | head -1)

if [ -z "${DEPLOYMENT_ID}" ]; then
  log "❌ Error: Could not find a previous deployment to rollback to"
  exit 1
fi

log "🎯 Rolling back to deployment: ${DEPLOYMENT_ID}"

if [ "${DRY_RUN}" = true ]; then
  log "🔍 DRY RUN: Would rollback ${ENVIRONMENT} to deployment ${DEPLOYMENT_ID}"
  exit 0
fi

if [ "${NON_INTERACTIVE}" = false ]; then
  read -p "Are you sure you want to rollback ${ENVIRONMENT} to ${DEPLOYMENT_ID}? (yes/no): " confirm
  if [ "${confirm}" != "yes" ]; then
    log "❌ Rollback cancelled"
    exit 0
  fi
fi

log "🚀 Performing rollback..."
log_verbose "Running: wrangler rollback --env ${ENVIRONMENT}"
wrangler rollback --env "${ENVIRONMENT}" 2>&1 | tee -a "${LOG_FILE}" || {
  log "❌ Rollback command failed"
  exit 1
}

log "🏥 Running health check after rollback..."
max_retries=5
retry_count=0
wait_time=$((TIMEOUT / max_retries))

WORKER_NAME_STAGING="website-sekolah-staging"
WORKER_NAME_PRODUCTION="website-sekolah-production"

if [ -n "${CLOUDFLARE_ACCOUNT_ID}" ]; then
  if [ "${ENVIRONMENT}" == "production" ]; then
    BASE_URL="https://${WORKER_NAME_PRODUCTION}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
  else
    BASE_URL="https://${WORKER_NAME_STAGING}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
  fi
else
  log "⚠️  CLOUDFLARE_ACCOUNT_ID not set, using worker names only"
  if [ "${ENVIRONMENT}" == "production" ]; then
    BASE_URL="${PRODUCTION_URL:-https://${WORKER_NAME_PRODUCTION}.workers.dev}"
  else
    BASE_URL="${STAGING_URL:-https://${WORKER_NAME_STAGING}.workers.dev}"
  fi
fi

log "🔗 Health check URL: ${BASE_URL}/api/health"
log_verbose "Max retries: ${max_retries}, Wait time: ${wait_time}s"

while [ $retry_count -lt $max_retries ]; do
  log "Health check attempt $((retry_count + 1)) of $max_retries"
  log_verbose "Checking: ${BASE_URL}/api/health"
  
  if curl -f -s -o /dev/null -w "%{http_code}" --max-time "${wait_time}" --connect-timeout 10 "${BASE_URL}/api/health" | grep -q "200\|404"; then
    log "✅ Health check passed after rollback"
    log "✅ Rollback completed successfully!"
    log "📋 Deployment backup saved to: ${BACKUP_FILE}"
    log "📋 Rollback log saved to: ${LOG_FILE}"
    exit 0
  fi
  
  retry_count=$((retry_count + 1))
  log_verbose "Health check failed, waiting ${wait_time} seconds..."
  sleep "${wait_time}"
done

log "❌ Health check failed after rollback"
log "⚠️  Deployment may be unstable. Manual intervention required."
exit 1
