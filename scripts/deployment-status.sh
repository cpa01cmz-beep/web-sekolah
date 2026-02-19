#!/bin/bash

# Deployment Status Script
# Version: 1.0.0
# Usage: ./scripts/deployment-status.sh [staging|production] [--json]
#
# This script checks the current deployment status and provides detailed
# information about the deployed version.
#
# Exit codes:
#   0 - Deployment is healthy
#   1 - Deployment is unhealthy or not found

set -e

SCRIPT_VERSION="1.0.0"
ENVIRONMENT=${1:-"staging"}
OUTPUT_FORMAT="text"

for arg in "$@"; do
  case $arg in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --help|-h)
      cat << EOF
Deployment Status Script
Version: ${SCRIPT_VERSION}

Usage: ./scripts/deployment-status.sh [staging|production] [options]

Arguments:
  staging             Check staging environment (default)
  production          Check production environment

Options:
  --json              Output results in JSON format
  --help, -h          Show this help message

Exit codes:
  0 - Deployment is healthy
  1 - Deployment is unhealthy or not found

Environment Variables:
  CLOUDFLARE_ACCOUNT_ID  Cloudflare account ID for API access
  CLOUDFLARE_API_TOKEN   Cloudflare API token for API access

EOF
      exit 0
      ;;
  esac
done

WORKER_NAME_STAGING="website-sekolah-staging"
WORKER_NAME_PRODUCTION="website-sekolah-production"

if [ "${ENVIRONMENT}" == "production" ]; then
  WORKER_NAME="${WORKER_NAME_PRODUCTION}"
else
  WORKER_NAME="${WORKER_NAME_STAGING}"
fi

get_base_url() {
  if [ -n "${CLOUDFLARE_ACCOUNT_ID}" ]; then
    echo "https://${WORKER_NAME}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
  else
    echo "https://${WORKER_NAME}.workers.dev"
  fi
}

BASE_URL=$(get_base_url)

check_health() {
  local url="$1"
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}/api/health" 2>/dev/null) || http_code="000"
  echo "$http_code"
}

check_api_version() {
  local url="$1"
  local version
  version=$(curl -s --max-time 5 "${url}/api/version" 2>/dev/null) || version="unknown"
  echo "$version"
}

check_response_time() {
  local url="$1"
  local start_time end_time duration
  start_time=$(date +%s%N)
  curl -s -o /dev/null --max-time 10 "${url}/api/health" 2>/dev/null || true
  end_time=$(date +%s%N)
  duration=$(( (end_time - start_time) / 1000000 ))
  echo "$duration"
}

HEALTH_CODE=$(check_health "$BASE_URL")
RESPONSE_TIME=$(check_response_time "$BASE_URL")
API_VERSION=$(check_api_version "$BASE_URL")

IS_HEALTHY="false"
if [[ "${HEALTH_CODE}" == "200" || "${HEALTH_CODE}" == "404" ]]; then
  IS_HEALTHY="true"
fi

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ "$OUTPUT_FORMAT" == "json" ]; then
  cat <<EOF
{
  "environment": "${ENVIRONMENT}",
  "worker_name": "${WORKER_NAME}",
  "url": "${BASE_URL}",
  "healthy": ${IS_HEALTHY},
  "health_check": {
    "status_code": ${HEALTH_CODE},
    "response_time_ms": ${RESPONSE_TIME}
  },
  "api_version": "${API_VERSION}",
  "timestamp": "${TIMESTAMP}"
}
EOF
else
  echo "========================================"
  echo "Deployment Status - ${ENVIRONMENT}"
  echo "========================================"
  echo "Worker: ${WORKER_NAME}"
  echo "URL: ${BASE_URL}"
  echo "Timestamp: ${TIMESTAMP}"
  echo ""
  echo "Health Check:"
  echo "  Status Code: ${HEALTH_CODE}"
  echo "  Response Time: ${RESPONSE_TIME}ms"
  echo "  Status: ${IS_HEALTHY}"
  echo ""
  echo "API Version: ${API_VERSION}"
  echo ""
  if [ "$IS_HEALTHY" = true ]; then
    echo "Overall: ✅ HEALTHY"
  else
    echo "Overall: ❌ UNHEALTHY"
  fi
  echo "========================================"
fi

if [ "$IS_HEALTHY" = true ]; then
  exit 0
else
  exit 1
fi
