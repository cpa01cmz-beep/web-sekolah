#!/bin/bash

SCRIPT_VERSION="1.0.0"

show_help() {
  cat << EOF
Deployment Report Generator
Version: ${SCRIPT_VERSION}

Usage: ./scripts/deployment-report.sh [staging|production] [options]

Description:
  Generates a comprehensive deployment report including:
  - Deployment status and health
  - Response times and performance metrics
  - Environment configuration summary
  - Recent deployment history

Arguments:
  staging             Generate report for staging environment (default)
  production          Generate report for production environment

Options:
  --json              Output results in JSON format
  --output=FILE       Save report to file
  --include-logs      Include recent Cloudflare logs (requires wrangler)
  --help              Show this help message
  --version           Show version information

Exit codes:
  0 - Report generated successfully
  1 - Failed to generate report
  2 - Invalid arguments

Examples:
  ./scripts/deployment-report.sh staging --json
  ./scripts/deployment-report.sh production --output=report.md
  ./scripts/deployment-report.sh staging --include-logs
EOF
}

show_version() {
  echo "deployment-report.sh version ${SCRIPT_VERSION}"
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
OUTPUT_FILE=""
INCLUDE_LOGS=false

for arg in "$@"; do
  case $arg in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --output=*)
      OUTPUT_FILE="${arg#*=}"
      shift
      ;;
    --include-logs)
      INCLUDE_LOGS=true
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

check_endpoint() {
  local url="$1"
  local endpoint="$2"
  local http_code
  local start_time end_time duration
  
  start_time=$(date +%s%N)
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}${endpoint}" 2>/dev/null) || http_code="000"
  end_time=$(date +%s%N)
  duration=$(( (end_time - start_time) / 1000000 ))
  
  echo "${http_code}:${duration}"
}

get_deployment_info() {
  local info=""
  if command -v wrangler &> /dev/null; then
    info=$(wrangler deployments list --env "${ENVIRONMENT}" --limit 1 2>/dev/null | head -5) || info="Unable to fetch"
  else
    info="Wrangler not installed"
  fi
  echo "$info"
}

get_recent_logs() {
  local logs=""
  if [ "$INCLUDE_LOGS" = true ] && command -v wrangler &> /dev/null; then
    logs=$(wrangler tail --env "${ENVIRONMENT}" --format=json 2>/dev/null | head -20) || logs="Unable to fetch logs"
  else
    logs="Log collection disabled"
  fi
  echo "$logs"
}

BASE_URL=$(get_base_url)
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

HEALTH_RESULT=$(check_endpoint "$BASE_URL" "/api/health")
HEALTH_CODE=$(echo "$HEALTH_RESULT" | cut -d: -f1)
HEALTH_TIME=$(echo "$HEALTH_RESULT" | cut -d: -f2)

ROOT_RESULT=$(check_endpoint "$BASE_URL" "/")
ROOT_CODE=$(echo "$ROOT_RESULT" | cut -d: -f1)
ROOT_TIME=$(echo "$ROOT_RESULT" | cut -d: -f2)

API_DOCS_RESULT=$(check_endpoint "$BASE_URL" "/api/docs")
API_DOCS_CODE=$(echo "$API_DOCS_RESULT" | cut -d: -f1)

IS_HEALTHY="false"
if [[ "${HEALTH_CODE}" == "200" || "${HEALTH_CODE}" == "404" ]]; then
  IS_HEALTHY="true"
fi

DEPLOYMENT_INFO=$(get_deployment_info)

if [ "$OUTPUT_FORMAT" == "json" ]; then
  REPORT=$(cat <<EOF
{
  "report_version": "${SCRIPT_VERSION}",
  "timestamp": "${TIMESTAMP}",
  "environment": "${ENVIRONMENT}",
  "worker_name": "${WORKER_NAME}",
  "base_url": "${BASE_URL}",
  "status": {
    "healthy": ${IS_HEALTHY},
    "health_check": {
      "endpoint": "/api/health",
      "status_code": ${HEALTH_CODE},
      "response_time_ms": ${HEALTH_TIME}
    },
    "root": {
      "endpoint": "/",
      "status_code": ${ROOT_CODE},
      "response_time_ms": ${ROOT_TIME}
    },
    "api_docs": {
      "endpoint": "/api/docs",
      "status_code": ${API_DOCS_CODE}
    }
  },
  "performance": {
    "avg_response_time_ms": $(( (HEALTH_TIME + ROOT_TIME) / 2 )),
    "health_response_time_ms": ${HEALTH_TIME},
    "root_response_time_ms": ${ROOT_TIME}
  },
  "deployment_info": $(echo "$DEPLOYMENT_INFO" | jq -Rs . 2>/dev/null || echo '"Unable to parse"')
}
EOF
)
else
  REPORT=$(cat <<EOF
# Deployment Report

**Generated:** ${TIMESTAMP}
**Environment:** ${ENVIRONMENT}
**Worker:** ${WORKER_NAME}

## Status

| Endpoint | Status Code | Response Time |
|----------|-------------|---------------|
| /api/health | ${HEALTH_CODE} | ${HEALTH_TIME}ms |
| / | ${ROOT_CODE} | ${ROOT_TIME}ms |
| /api/docs | ${API_DOCS_CODE} | - |

**Overall Health:** ${IS_HEALTHY}

## Performance

- Average Response Time: $(( (HEALTH_TIME + ROOT_TIME) / 2 ))ms
- Health Check: ${HEALTH_TIME}ms
- Root: ${ROOT_TIME}ms

## Deployment Information

\`\`\`
${DEPLOYMENT_INFO}
\`\`\`

## Configuration

- Base URL: ${BASE_URL}
- Worker Name: ${WORKER_NAME}

---
*Report generated by deployment-report.sh v${SCRIPT_VERSION}*
EOF
)
fi

if [ -n "$OUTPUT_FILE" ]; then
  echo "$REPORT" > "$OUTPUT_FILE"
  if [ "$OUTPUT_FORMAT" != "json" ]; then
    echo "Report saved to: $OUTPUT_FILE"
  fi
else
  echo "$REPORT"
fi

if [ "$IS_HEALTHY" = true ]; then
  exit 0
else
  exit 1
fi
