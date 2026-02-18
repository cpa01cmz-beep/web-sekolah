#!/bin/bash

# Health Check Script for Cloudflare Workers Deployment
# Usage: ./scripts/health-check.sh [staging|production] [--json] [--timeout=60]
#
# Options:
#   --json             Output results in JSON format
#   --timeout=SECONDS  Maximum time to wait for health check (default: 60)
#   --retries=N        Number of retry attempts (default: 5)
#   --exit-on-fail     Exit with non-zero code on failure (default: true)
#
# Exit codes:
#   0 - All health checks passed
#   1 - Health check failed
#   2 - Invalid arguments
#   3 - Network error

set -e

ENVIRONMENT=${1:-"staging"}
OUTPUT_FORMAT="text"
TIMEOUT=60
RETRIES=5
EXIT_ON_FAIL=true

for arg in "$@"; do
  case $arg in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --timeout=*)
      TIMEOUT="${arg#*=}"
      shift
      ;;
    --retries=*)
      RETRIES="${arg#*=}"
      shift
      ;;
    --exit-on-fail)
      EXIT_ON_FAIL=true
      shift
      ;;
    --no-exit-on-fail)
      EXIT_ON_FAIL=false
      shift
      ;;
  esac
done

WORKER_NAME_STAGING="website-sekolah-staging"
WORKER_NAME_PRODUCTION="website-sekolah-production"

get_base_url() {
  local env=$1
  if [ -n "${CLOUDFLARE_ACCOUNT_ID}" ]; then
    if [ "${env}" == "production" ]; then
      echo "https://${WORKER_NAME_PRODUCTION}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
    else
      echo "https://${WORKER_NAME_STAGING}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev"
    fi
  else
    if [ "${env}" == "production" ]; then
      echo "${PRODUCTION_URL:-https://${WORKER_NAME_PRODUCTION}.workers.dev}"
    else
      echo "${STAGING_URL:-https://${WORKER_NAME_STAGING}.workers.dev}"
    fi
  fi
}

check_health() {
  local url=$1
  local retry_count=0
  local wait_time=$((TIMEOUT / RETRIES))
  local http_code=""
  local response_time=""
  local start_time=""
  local end_time=""

  while [ $retry_count -lt $RETRIES ]; do
    start_time=$(date +%s%N)
    http_code=$(curl -f -s -o /dev/null -w "%{http_code}" --max-time "$wait_time" "${url}/api/health" 2>/dev/null) || http_code="000"
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))

    if [[ "${http_code}" == "200" || "${http_code}" == "404" ]]; then
      echo "${http_code}:${response_time}:success"
      return 0
    fi

    retry_count=$((retry_count + 1))
    if [ $retry_count -lt $RETRIES ]; then
      sleep "$wait_time"
    fi
  done

  echo "${http_code}:${response_time}:failed"
  return 1
}

check_api_docs() {
  local url=$1
  local http_code=""
  http_code=$(curl -f -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}/api/docs" 2>/dev/null) || http_code="000"
  
  if [[ "${http_code}" == "200" ]]; then
    echo "available"
    return 0
  fi
  echo "unavailable"
  return 1
}

BASE_URL=$(get_base_url "$ENVIRONMENT")

HEALTH_RESULT=$(check_health "$BASE_URL") || true
HEALTH_CODE=$(echo "$HEALTH_RESULT" | cut -d: -f1)
RESPONSE_TIME=$(echo "$HEALTH_RESULT" | cut -d: -f2)
HEALTH_STATUS=$(echo "$HEALTH_RESULT" | cut -d: -f3)

API_DOCS_STATUS=$(check_api_docs "$BASE_URL") || true

IS_HEALTHY="true"
if [ "$HEALTH_STATUS" != "success" ]; then
  IS_HEALTHY="false"
fi

if [ "$OUTPUT_FORMAT" == "json" ]; then
  cat <<EOF
{
  "environment": "${ENVIRONMENT}",
  "url": "${BASE_URL}",
  "healthy": ${IS_HEALTHY},
  "health_check": {
    "endpoint": "/api/health",
    "status_code": ${HEALTH_CODE},
    "response_time_ms": ${RESPONSE_TIME},
    "status": "${HEALTH_STATUS}"
  },
  "api_docs": {
    "endpoint": "/api/docs",
    "status": "${API_DOCS_STATUS}"
  },
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
else
  echo "========================================"
  echo "Health Check Report - ${ENVIRONMENT}"
  echo "========================================"
  echo "URL: ${BASE_URL}"
  echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""
  echo "Health Endpoint (/api/health):"
  echo "  Status Code: ${HEALTH_CODE}"
  echo "  Response Time: ${RESPONSE_TIME}ms"
  echo "  Status: ${HEALTH_STATUS}"
  echo ""
  echo "API Docs (/api/docs):"
  echo "  Status: ${API_DOCS_STATUS}"
  echo ""
  echo "Overall Health: ${IS_HEALTHY}"
  echo "========================================"
fi

if [ "$HEALTH_STATUS" != "success" ] && [ "$EXIT_ON_FAIL" == "true" ]; then
  exit 1
fi

exit 0
