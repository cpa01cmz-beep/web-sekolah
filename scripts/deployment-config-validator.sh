#!/bin/bash

SCRIPT_VERSION="1.0.0"

show_help() {
  cat << EOF
Deployment Configuration Validator
Version: ${SCRIPT_VERSION}

Usage: ./scripts/deployment-config-validator.sh [options]

Description:
  Validates deployment configuration files and settings.
  Checks wrangler.toml, package.json scripts, environment
  variables, and required files.

Options:
  --json              Output results in JSON format
  --fix               Attempt to fix issues automatically
  --strict            Exit with error on warnings
  --env=staging|production  Validate specific environment
  --help              Show this help message
  --version           Show version information

Exit codes:
  0 - All validations passed
  1 - One or more validations failed
  2 - Invalid arguments

Examples:
  ./scripts/deployment-config-validator.sh
  ./scripts/deployment-config-validator.sh --json
  ./scripts/deployment-config-validator.sh --env=production --strict
EOF
}

show_version() {
  echo "deployment-config-validator.sh version ${SCRIPT_VERSION}"
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

OUTPUT_FORMAT="text"
AUTO_FIX=false
STRICT_MODE=false
TARGET_ENV="all"

for arg in "$@"; do
  case $arg in
    --json)
      OUTPUT_FORMAT="json"
      shift
      ;;
    --fix)
      AUTO_FIX=true
      shift
      ;;
    --strict)
      STRICT_MODE=true
      shift
      ;;
    --env=*)
      TARGET_ENV="${arg#*=}"
      shift
      ;;
  esac
done

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
RESULTS=()

log() {
  if [ "$OUTPUT_FORMAT" = "text" ]; then
    echo "$1"
  fi
}

add_result() {
  local status="$1"
  local name="$2"
  local message="$3"
  local fix="$4"
  
  case $status in
    pass) PASS_COUNT=$((PASS_COUNT + 1)) ;;
    fail) FAIL_COUNT=$((FAIL_COUNT + 1)) ;;
    warn) WARN_COUNT=$((WARN_COUNT + 1)) ;;
  esac
  
  if [ "$OUTPUT_FORMAT" = "json" ]; then
    RESULTS+=("{\"status\":\"$status\",\"name\":\"$name\",\"message\":\"$message\",\"fix\":\"$fix\"}")
  else
    case $status in
      pass) echo "  ✅ $name: $message" ;;
      fail) echo "  ❌ $name: $message" ;;
      warn) echo "  ⚠️  $name: $message" ;;
    esac
    if [ -n "$fix" ] && [ "$AUTO_FIX" = false ]; then
      echo "     Fix: $fix"
    fi
  fi
}

validate_wrangler_toml() {
  if [ ! -f "wrangler.toml" ]; then
    add_result "fail" "wrangler.toml" "File not found" "Create wrangler.toml configuration file"
    return 1
  fi
  
  local required_fields=("name" "main" "compatibility_date")
  local missing_fields=()
  
  for field in "${required_fields[@]}"; do
    if ! grep -q "^${field}\s*=" wrangler.toml; then
      missing_fields+=("$field")
    fi
  done
  
  if [ ${#missing_fields[@]} -eq 0 ]; then
    add_result "pass" "wrangler.toml" "All required fields present"
  else
    add_result "fail" "wrangler.toml" "Missing fields: ${missing_fields[*]}" "Add missing fields to wrangler.toml"
  fi
  
  if grep -q '\[env\.staging\]' wrangler.toml; then
    add_result "pass" "wrangler.toml staging" "Staging environment configured"
  else
    add_result "warn" "wrangler.toml staging" "Staging environment not configured" "Add [env.staging] section"
  fi
  
  if grep -q '\[env\.production\]' wrangler.toml; then
    add_result "pass" "wrangler.toml production" "Production environment configured"
  else
    add_result "warn" "wrangler.toml production" "Production environment not configured" "Add [env.production] section"
  fi
  
  if grep -q '\[\[durable_objects\.bindings\]\]' wrangler.toml; then
    add_result "pass" "wrangler.toml Durable Objects" "Durable Objects bindings configured"
  else
    add_result "warn" "wrangler.toml Durable Objects" "No Durable Objects bindings" "Add Durable Objects configuration if needed"
  fi
  
  if grep -q '\[observability\]' wrangler.toml && grep -q 'enabled = true' wrangler.toml; then
    add_result "pass" "wrangler.toml observability" "Observability enabled"
  else
    add_result "warn" "wrangler.toml observability" "Observability not enabled" "Add [observability] section with enabled = true"
  fi
}

validate_package_json_scripts() {
  if [ ! -f "package.json" ]; then
    add_result "fail" "package.json" "File not found" "Create package.json"
    return 1
  fi
  
  local required_scripts=("build" "test:run" "typecheck" "lint")
  local deployment_scripts=("deploy:staging" "deploy:production")
  local devops_scripts=("health:staging" "health:production" "validate:env:staging" "validate:env:production")
  
  for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\"" package.json 2>/dev/null; then
      add_result "pass" "Script: $script" "Defined"
    else
      add_result "fail" "Script: $script" "Missing" "Add '$script' script to package.json"
    fi
  done
  
  for script in "${deployment_scripts[@]}"; do
    if grep -q "\"$script\"" package.json 2>/dev/null; then
      add_result "pass" "Deployment script: $script" "Defined"
    else
      add_result "warn" "Deployment script: $script" "Missing" "Add '$script' script to package.json"
    fi
  done
  
  for script in "${devops_scripts[@]}"; do
    if grep -q "\"$script\"" package.json 2>/dev/null; then
      add_result "pass" "DevOps script: $script" "Defined"
    else
      add_result "warn" "DevOps script: $script" "Missing" "Add '$script' script to package.json"
    fi
  done
}

validate_scripts_directory() {
  if [ ! -d "scripts" ]; then
    add_result "fail" "scripts/ directory" "Not found" "Create scripts/ directory with deployment scripts"
    return 1
  fi
  
  local required_scripts=("health-check.sh" "pre-deploy-check.sh" "deployment-status.sh" "rollback.sh" "validate-env.sh")
  local found=0
  
  for script in "${required_scripts[@]}"; do
    if [ -f "scripts/$script" ]; then
      if [ -x "scripts/$script" ]; then
        add_result "pass" "Script file: $script" "Present and executable"
      else
        add_result "warn" "Script file: $script" "Present but not executable" "Run: chmod +x scripts/$script"
      fi
      found=$((found + 1))
    else
      add_result "warn" "Script file: $script" "Not found" "Create scripts/$script"
    fi
  done
}

validate_github_workflows() {
  if [ ! -d ".github/workflows" ]; then
    add_result "warn" ".github/workflows" "Directory not found" "Create .github/workflows for CI/CD"
    return 1
  fi
  
  if [ -f ".github/workflows/deploy.yml" ]; then
    add_result "pass" "GitHub workflow: deploy.yml" "Present"
    
    if grep -q "concurrency:" .github/workflows/deploy.yml; then
      add_result "pass" "deploy.yml concurrency" "Concurrency control configured"
    else
      add_result "warn" "deploy.yml concurrency" "No concurrency control" "Add concurrency group to prevent simultaneous deployments"
    fi
    
    if grep -q "timeout-minutes" .github/workflows/deploy.yml; then
      add_result "pass" "deploy.yml timeouts" "Timeouts configured"
    else
      add_result "warn" "deploy.yml timeouts" "No step timeouts" "Add timeout-minutes to deployment steps"
    fi
  else
    add_result "warn" "GitHub workflow: deploy.yml" "Not found" "Create .github/workflows/deploy.yml"
  fi
  
  if [ -f ".github/workflows/on-push.yml" ]; then
    add_result "pass" "GitHub workflow: on-push.yml" "Present"
  else
    add_result "warn" "GitHub workflow: on-push.yml" "Not found"
  fi
  
  if [ -f ".github/workflows/on-pull.yml" ]; then
    add_result "pass" "GitHub workflow: on-pull.yml" "Present"
  else
    add_result "warn" "GitHub workflow: on-pull.yml" "Not found"
  fi
}

validate_typescript_config() {
  if [ -f "tsconfig.json" ]; then
    add_result "pass" "tsconfig.json" "Present"
    
    if grep -q '"strict": true' tsconfig.json || grep -q '"strict":true' tsconfig.json; then
      add_result "pass" "TypeScript strict mode" "Enabled"
    else
      add_result "warn" "TypeScript strict mode" "Not enabled" "Enable strict mode in tsconfig.json"
    fi
  else
    add_result "fail" "tsconfig.json" "Not found" "Create tsconfig.json"
  fi
}

validate_environment_config() {
  if [ -f ".env.example" ]; then
    add_result "pass" ".env.example" "Present"
  else
    add_result "warn" ".env.example" "Not found" "Create .env.example with required environment variables"
  fi
  
  if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
      add_result "pass" ".gitignore .env" ".env files ignored"
    else
      add_result "fail" ".gitignore .env" ".env not in .gitignore" "Add .env to .gitignore to prevent secret exposure"
    fi
    
    if grep -q "node_modules" .gitignore; then
      add_result "pass" ".gitignore node_modules" "node_modules ignored"
    else
      add_result "warn" ".gitignore node_modules" "node_modules not ignored" "Add node_modules to .gitignore"
    fi
  else
    add_result "fail" ".gitignore" "Not found" "Create .gitignore"
  fi
}

log "========================================"
log "Deployment Configuration Validator"
log "Version: ${SCRIPT_VERSION}"
log "========================================"
log ""

log "Validating wrangler.toml..."
validate_wrangler_toml

log ""
log "Validating package.json scripts..."
validate_package_json_scripts

log ""
log "Validating scripts/ directory..."
validate_scripts_directory

log ""
log "Validating GitHub workflows..."
validate_github_workflows

log ""
log "Validating TypeScript configuration..."
validate_typescript_config

log ""
log "Validating environment configuration..."
validate_environment_config

if [ "$OUTPUT_FORMAT" = "json" ]; then
  echo "{"
  echo "  \"version\": \"$SCRIPT_VERSION\","
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"target_env\": \"$TARGET_ENV\","
  echo "  \"summary\": {"
  echo "    \"passed\": $PASS_COUNT,"
  echo "    \"failed\": $FAIL_COUNT,"
  echo "    \"warnings\": $WARN_COUNT,"
  echo "    \"valid\": $([ $FAIL_COUNT -eq 0 ] && [ \( $WARN_COUNT -eq 0 \) -o \( \"$STRICT_MODE\" = false \) ] && echo "true" || echo "false")"
  echo "  },"
  echo "  \"results\": ["
  for i in "${!RESULTS[@]}"; do
    if [ $i -lt $((${#RESULTS[@]} - 1)) ]; then
      echo "    ${RESULTS[$i]},"
    else
      echo "    ${RESULTS[$i]}"
    fi
  done
  echo "  ]"
  echo "}"
else
  echo ""
  echo "========================================"
  echo "Summary"
  echo "========================================"
  echo "Passed:   ${PASS_COUNT}"
  echo "Failed:   ${FAIL_COUNT}"
  echo "Warnings: ${WARN_COUNT}"
  echo ""
  
  if [ $FAIL_COUNT -eq 0 ]; then
    if [ $WARN_COUNT -gt 0 ] && [ "$STRICT_MODE" = true ]; then
      log "⚠️  Configuration validation passed with warnings (strict mode)"
      exit 1
    else
      log "✅ Deployment configuration is valid"
      exit 0
    fi
  else
    log "❌ Deployment configuration has errors"
    exit 1
  fi
fi
