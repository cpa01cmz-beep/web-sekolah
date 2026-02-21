#!/bin/bash

# Environment Configuration Validator
# Version: 1.0.0
# Usage: ./scripts/validate-env.sh [staging|production] [--json]
#
# Validates environment configuration before deployment.
# Checks for required secrets, environment variables, and configuration.
#
# Exit codes:
#   0 - All validations passed
#   1 - One or more validations failed

SCRIPT_VERSION="1.0.0"
ENVIRONMENT=${1:-"staging"}
OUTPUT_JSON=false

for arg in "$@"; do
  case $arg in
    --json|-j)
      OUTPUT_JSON=true
      shift
      ;;
    --help|-h)
      cat << EOF
Environment Configuration Validator
Version: ${SCRIPT_VERSION}

Usage: ./scripts/validate-env.sh [staging|production] [options]

Arguments:
  staging             Validate staging environment (default)
  production          Validate production environment

Options:
  --json, -j          Output results in JSON format
  --help, -h          Show this help message

Exit codes:
  0 - All validations passed
  1 - One or more validations failed

EOF
      exit 0
      ;;
  esac
done

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
RESULTS=()

log() {
  if [ "$OUTPUT_JSON" = false ]; then
    echo "$1"
  fi
}

add_result() {
  local status="$1"
  local name="$2"
  local message="$3"
  
  case $status in
    pass) PASS_COUNT=$((PASS_COUNT + 1)) ;;
    fail) FAIL_COUNT=$((FAIL_COUNT + 1)) ;;
    warn) WARN_COUNT=$((WARN_COUNT + 1)) ;;
  esac
  
  RESULTS+=("{\"status\":\"$status\",\"name\":\"$name\",\"message\":\"$message\"}")
}

check_file_exists() {
  local file="$1"
  local name="$2"
  local required="$3"
  
  if [ -f "$file" ]; then
    add_result "pass" "$name" "File exists: $file"
    return 0
  elif [ "$required" = "required" ]; then
    add_result "fail" "$name" "Required file missing: $file"
    return 1
  else
    add_result "warn" "$name" "Optional file missing: $file"
    return 2
  fi
}

check_env_var() {
  local var_name="$1"
  local description="$2"
  local required="$3"
  
  if [ -n "${!var_name}" ]; then
    add_result "pass" "$description" "$var_name is set"
    return 0
  elif [ "$required" = "required" ]; then
    add_result "fail" "$description" "$var_name is not set (required)"
    return 1
  else
    add_result "warn" "$description" "$var_name is not set (optional)"
    return 2
  fi
}

check_secret_strength() {
  local var_name="$1"
  local description="$2"
  local min_length="$3"
  local required="${4:-optional}"
  local value="${!var_name}"
  
  if [ -z "$value" ]; then
    if [ "$required" = "required" ]; then
      add_result "fail" "$description" "Secret is not set (required)"
      return 1
    else
      add_result "warn" "$description" "Secret is not set (optional)"
      return 2
    fi
  fi
  
  local length=${#value}
  if [ $length -lt $min_length ]; then
    add_result "warn" "$description" "Secret length ($length) is below recommended ($min_length chars)"
    return 2
  fi
  
  add_result "pass" "$description" "Secret meets minimum length requirement ($length chars)"
  return 0
}

validate_wrangler_config() {
  local config_file="wrangler.jsonc"
  
  if [ -f "$config_file" ]; then
    if grep -q '"name"' "$config_file" && grep -q '"main"' "$config_file"; then
      add_result "pass" "Wrangler Config" "Valid wrangler.jsonc configuration"
    else
      add_result "fail" "Wrangler Config" "Invalid wrangler.jsonc - missing required fields"
    fi
  else
    add_result "fail" "Wrangler Config" "wrangler.jsonc not found"
  fi
}

validate_package_scripts() {
  local scripts=("build" "test:run" "typecheck" "lint")
  local missing=0
  
  for script in "${scripts[@]}"; do
    if ! grep -q "\"$script\"" package.json; then
      add_result "fail" "Package Script: $script" "Missing required npm script"
      missing=$((missing + 1))
    fi
  done
  
  if [ $missing -eq 0 ]; then
    add_result "pass" "Package Scripts" "All required npm scripts present"
  fi
}

validate_node_version() {
  local required_major=18
  local current_version=$(node -v 2>/dev/null | sed 's/v//')
  
  if [ -z "$current_version" ]; then
    add_result "fail" "Node.js Version" "Node.js is not installed"
    return 1
  fi
  
  local current_major=$(echo $current_version | cut -d. -f1)
  
  if [ $current_major -ge $required_major ]; then
    add_result "pass" "Node.js Version" "Node.js v$current_version (required: >=v$required_major)"
  else
    add_result "fail" "Node.js Version" "Node.js v$current_version is too old (required: >=v$required_major)"
  fi
}

validate_npm_ci() {
  if [ -f "package-lock.json" ]; then
    add_result "pass" "Package Lock" "package-lock.json exists"
  else
    add_result "warn" "Package Lock" "package-lock.json missing - run 'npm install'"
  fi
}

if [ "$OUTPUT_JSON" = false ]; then
  echo "========================================"
  echo "Environment Configuration Validator"
  echo "Version: ${SCRIPT_VERSION}"
  echo "Environment: ${ENVIRONMENT}"
  echo "========================================"
  echo ""
fi

log "Validating project configuration..."
check_file_exists "package.json" "Package Config" "required"
check_file_exists "tsconfig.json" "TypeScript Config" "required"
validate_wrangler_config
validate_package_scripts
validate_node_version
validate_npm_ci

log ""
log "Validating environment variables..."

check_env_var "ENVIRONMENT" "Environment Name" "optional"
check_env_var "ALLOWED_ORIGINS" "CORS Origins" "optional"

if [ "$ENVIRONMENT" = "production" ]; then
  check_secret_strength "JWT_SECRET" "JWT Secret (Production)" 32 "required"
  check_env_var "CLOUDFLARE_ACCOUNT_ID" "Cloudflare Account ID" "required"
  check_env_var "CLOUDFLARE_API_TOKEN" "Cloudflare API Token" "required"
else
  check_secret_strength "JWT_SECRET" "JWT Secret" 16 "optional"
  check_env_var "CLOUDFLARE_ACCOUNT_ID" "Cloudflare Account ID" "optional"
  check_env_var "CLOUDFLARE_API_TOKEN" "Cloudflare API Token" "optional"
fi

if [ "$OUTPUT_JSON" = true ]; then
  echo "{"
  echo "  \"version\": \"$SCRIPT_VERSION\","
  echo "  \"environment\": \"$ENVIRONMENT\","
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"summary\": {"
  echo "    \"passed\": $PASS_COUNT,"
  echo "    \"failed\": $FAIL_COUNT,"
  echo "    \"warnings\": $WARN_COUNT"
  echo "  },"
  echo "  \"results\": ["
  for i in "${!RESULTS[@]}"; do
    if [ $i -lt $((${#RESULTS[@]} - 1)) ]; then
      echo "    ${RESULTS[$i]},"
    else
      echo "    ${RESULTS[$i]}"
    fi
  done
  echo "  ],"
  echo "  \"status\": \"$([ $FAIL_COUNT -eq 0 ] && echo "passed" || echo "failed")\""
  echo "}"
else
  echo ""
  echo "========================================"
  echo "Validation Summary"
  echo "========================================"
  echo "Passed:   ${PASS_COUNT}"
  echo "Failed:   ${FAIL_COUNT}"
  echo "Warnings: ${WARN_COUNT}"
  echo ""

  if [ $FAIL_COUNT -eq 0 ]; then
    log "✅ Environment validation passed for ${ENVIRONMENT}"
    exit 0
  else
    log "❌ Environment validation failed for ${ENVIRONMENT}"
    exit 1
  fi
fi
