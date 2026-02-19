#!/bin/bash

# Pre-deployment Verification Script
# Version: 1.0.0
# Usage: ./scripts/pre-deploy-check.sh [staging|production]
#
# This script runs all pre-deployment checks to ensure the codebase is ready
# for deployment. It should be run before any deployment to catch issues early.
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed

set -e

SCRIPT_VERSION="1.0.0"
ENVIRONMENT=${1:-"staging"}
VERBOSE=false

for arg in "$@"; do
  case $arg in
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      cat << EOF
Pre-deployment Verification Script
Version: ${SCRIPT_VERSION}

Usage: ./scripts/pre-deploy-check.sh [staging|production] [options]

Arguments:
  staging             Run checks for staging environment (default)
  production          Run checks for production environment

Options:
  --verbose, -v       Enable verbose output
  --help, -h          Show this help message

Exit codes:
  0 - All checks passed
  1 - One or more checks failed

EOF
      exit 0
      ;;
  esac
done

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_verbose() {
  if [ "$VERBOSE" = true ]; then
    echo "[DEBUG] $1"
  fi
}

PASS_COUNT=0
FAIL_COUNT=0

run_check() {
  local name="$1"
  local command="$2"
  
  log "Running: $name"
  log_verbose "Command: $command"
  
  if eval "$command" > /tmp/check_output.txt 2>&1; then
    log "✅ PASSED: $name"
    PASS_COUNT=$((PASS_COUNT + 1))
    return 0
  else
    log "❌ FAILED: $name"
    if [ "$VERBOSE" = true ]; then
      cat /tmp/check_output.txt
    fi
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return 1
  fi
}

echo "========================================"
echo "Pre-deployment Verification"
echo "Environment: ${ENVIRONMENT}"
echo "========================================"
echo ""

log "Starting pre-deployment checks..."

run_check "TypeScript Type Check" "npm run typecheck"
run_check "ESLint Check" "npm run lint"
run_check "Unit Tests" "npm run test:run"
run_check "Build" "npm run build"

echo ""
echo "========================================"
echo "Pre-deployment Summary"
echo "========================================"
echo "Passed: ${PASS_COUNT}"
echo "Failed: ${FAIL_COUNT}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  log "✅ All pre-deployment checks passed. Ready for deployment to ${ENVIRONMENT}."
  exit 0
else
  log "❌ ${FAIL_COUNT} check(s) failed. Fix issues before deploying to ${ENVIRONMENT}."
  exit 1
fi
