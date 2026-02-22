#!/bin/bash

SCRIPT_VERSION="1.0.0"

show_help() {
  cat << EOF
Deployment Metrics Script
Version: ${SCRIPT_VERSION}

Usage: ./scripts/deployment-metrics.sh [staging|production] [options]

Description:
  Collects and reports deployment metrics including response times,
  health status, and performance indicators.

Arguments:
  staging             Collect metrics for staging environment (default)
  production          Collect metrics for production environment

Options:
  --json              Output results in JSON format
  --watch             Continuously monitor (updates every 30s)
  --history=N         Show last N deployment metrics (default: 5)
  --help              Show this help message
  --version           Show version information

Exit codes:
  0 - Metrics collected successfully
  1 - Failed to collect metrics
  2 - Invalid arguments

Environment Variables:
  CLOUDFLARE_ACCOUNT_ID  Cloudflare account ID
  CLOUDFLARE_API_TOKEN   Cloudflare API token

Examples:
  ./scripts/deployment-metrics.sh staging --json
  ./scripts/deployment-metrics.sh production --watch
  ./scripts/deployment-metrics.sh staging --history=10
EOF
}

show_version() {
  echo "deployment-metrics.sh version ${SCRIPT_VERSION}"
}

for arg in "$@"; do
  case $arg in
    --help|-h)
      show_help
      exit 0
      ;;
    --version|-v)
      show_version
      exit 0
      ;;
  esac
done

ENVIRONMENT=${1:-"staging"}
OUTPUT_FORMAT="text"
WATCH_MODE=false
HISTORY_COUNT=5

for arg in "$@"; do
  case $arg in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --watch)
      WATCH_MODE=true
      shift
      ;;
    --history=*)
      HISTORY_COUNT="${arg#*=}"
      shift
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

measure_response_time() {
  local url="$1"
  local start_time end_time duration
  
  start_time=$(date +%s%N)
  curl -s -o /dev/null --max-time 10 "${url}" 2>/dev/null || return 1
  end_time=$(date +%s%N)
  duration=$(( (end_time - start_time) / 1000000 ))
  echo "$duration"
}

check_endpoint() {
  local url="$1"
  local endpoint="$2"
  local http_code
  
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}${endpoint}" 2>/dev/null) || http_code="000"
  echo "$http_code"
}

collect_metrics() {
  local base_url="$1"
  local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  
  local health_code=$(check_endpoint "$base_url" "/api/health")
  local api_docs_code=$(check_endpoint "$base_url" "/api/docs")
  local root_code=$(check_endpoint "$base_url" "/")
  
  local health_time=$(measure_response_time "${base_url}/api/health") || health_time="timeout"
  local root_time=$(measure_response_time "${base_url}/") || root_time="timeout"
  
  local is_healthy="false"
  if [[ "${health_code}" == "200" || "${health_code}" == "404" ]]; then
    is_healthy="true"
  fi
  
  if [ "$OUTPUT_FORMAT" == "json" ]; then
    cat <<EOF
{
  "timestamp": "${timestamp}",
  "environment": "${ENVIRONMENT}",
  "worker_name": "${WORKER_NAME}",
  "base_url": "${base_url}",
  "healthy": ${is_healthy},
  "endpoints": {
    "health": {
      "url": "${base_url}/api/health",
      "status_code": ${health_code},
      "response_time_ms": ${health_time:-null}
    },
    "root": {
      "url": "${base_url}/",
      "status_code": ${root_code},
      "response_time_ms": ${root_time:-null}
    },
    "api_docs": {
      "url": "${base_url}/api/docs",
      "status_code": ${api_docs_code}
    }
  },
  "summary": {
    "all_endpoints_healthy": $([ "${health_code}" != "000" ] && [ "${root_code}" != "000" ] && echo "true" || echo "false"),
    "avg_response_time_ms": $([ "${health_time}" != "timeout" ] && [ "${root_time}" != "timeout" ] && echo $(( (health_time + root_time) / 2 )) || echo "null")
  }
}
EOF
  else
    echo "========================================"
    echo "Deployment Metrics - ${ENVIRONMENT}"
    echo "Timestamp: ${timestamp}"
    echo "========================================"
    echo ""
    echo "Worker: ${WORKER_NAME}"
    echo "Base URL: ${base_url}"
    echo ""
    echo "Endpoint Status:"
    echo "  /api/health  : HTTP ${health_code} (${health_time}ms)"
    echo "  /            : HTTP ${root_code} (${root_time}ms)"
    echo "  /api/docs    : HTTP ${api_docs_code}"
    echo ""
    echo "Overall Health: ${is_healthy}"
    echo "========================================"
  fi
}

BASE_URL=$(get_base_url)

if [ "$WATCH_MODE" = true ]; then
  echo "Watching deployment metrics (Ctrl+C to stop)..."
  echo ""
  while true; do
    collect_metrics "$BASE_URL"
    echo ""
    echo "Next update in 30 seconds..."
    sleep 30
  done
else
  collect_metrics "$BASE_URL"
fi

exit 0
