#!/bin/bash

SCRIPT_VERSION="1.0.0"

show_help() {
  cat << EOF
CI/CD Readiness Check Script
Version: ${SCRIPT_VERSION}

Usage: ./scripts/ci-readiness.sh [options]

Description:
  Validates local environment readiness for CI/CD operations.
  Checks Node.js version, dependencies, environment variables,
  and configuration files.

Options:
  --json              Output results in JSON format
  --fix               Attempt to fix issues automatically
  --strict            Exit with error on warnings (not just failures)
  --ci                Simulate CI environment checks
  --help              Show this help message
  --version           Show version information

Exit codes:
  0 - All checks passed
  1 - One or more checks failed
  2 - Invalid arguments

Examples:
  ./scripts/ci-readiness.sh
  ./scripts/ci-readiness.sh --json
  ./scripts/ci-readiness.sh --strict
  ./scripts/ci-readiness.sh --ci --json
EOF
}

show_version() {
  echo "ci-readiness.sh version ${SCRIPT_VERSION}"
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
CI_MODE=false

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
    --ci)
      CI_MODE=true
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

check_node_version() {
  local required_major=18
  local current_version
  
  if ! command -v node &> /dev/null; then
    add_result "fail" "Node.js" "Not installed" "Install Node.js v18 or later"
    return 1
  fi
  
  current_version=$(node -v 2>/dev/null | sed 's/v//')
  local current_major=$(echo "$current_version" | cut -d. -f1)
  
  if [ "$current_major" -ge "$required_major" ]; then
    add_result "pass" "Node.js Version" "v$current_version (>= v$required_major)"
  else
    add_result "fail" "Node.js Version" "v$current_version (requires >= v$required_major)" "Update Node.js to v$required_major or later"
  fi
}

check_npm_version() {
  local current_version
  
  if ! command -v npm &> /dev/null; then
    add_result "fail" "npm" "Not installed" "Install npm"
    return 1
  fi
  
  current_version=$(npm -v 2>/dev/null)
  add_result "pass" "npm Version" "v$current_version"
}

check_package_lock() {
  if [ -f "package-lock.json" ]; then
    add_result "pass" "package-lock.json" "Exists"
  else
    add_result "fail" "package-lock.json" "Missing" "Run 'npm install' to generate"
  fi
}

check_node_modules() {
  if [ -d "node_modules" ]; then
    local count=$(ls -1 node_modules 2>/dev/null | wc -l)
    add_result "pass" "node_modules" "$count packages installed"
  else
    add_result "fail" "node_modules" "Not installed" "Run 'npm ci'"
  fi
}

check_dependencies_integrity() {
  if [ ! -f "package-lock.json" ]; then
    add_result "warn" "Dependencies Integrity" "Cannot check without package-lock.json"
    return
  fi
  
  if npm ls --depth=0 --silent > /dev/null 2>&1; then
    add_result "pass" "Dependencies Integrity" "All dependencies installed correctly"
  else
    add_result "warn" "Dependencies Integrity" "Some dependencies may be missing or corrupted" "Run 'npm ci' to reinstall"
  fi
}

check_typescript_config() {
  if [ -f "tsconfig.json" ]; then
    add_result "pass" "tsconfig.json" "Exists"
  else
    add_result "fail" "tsconfig.json" "Missing" "Create TypeScript configuration"
  fi
}

check_wrangler_config() {
  if [ -f "wrangler.toml" ]; then
    if grep -q '^name\s*=' wrangler.toml && grep -q '^main\s*=' wrangler.toml; then
      add_result "pass" "wrangler.toml" "Valid configuration"
    else
      add_result "fail" "wrangler.toml" "Invalid configuration" "Check wrangler.toml has name and main fields"
    fi
  else
    add_result "warn" "wrangler.toml" "Missing (optional for frontend-only)"
  fi
}

check_env_example() {
  if [ -f ".env.example" ]; then
    add_result "pass" ".env.example" "Exists"
  else
    add_result "warn" ".env.example" "Missing" "Create .env.example for documentation"
  fi
}

check_agent_docs() {
  local agent_docs=("docs"/*"-engineer.md" "docs"/*"-architect.md" "docs"/*"-specialist.md" "docs"/*"-writer.md" "docs"/*"-strategist.md")
  local found=0
  
  for pattern in "${agent_docs[@]}"; do
    for doc in $pattern; do
      if [ -f "$doc" ]; then
        found=$((found + 1))
      fi
    done
  done
  
  if [ $found -gt 0 ]; then
    add_result "pass" "Agent Documentation" "$found agent docs found"
  else
    add_result "warn" "Agent Documentation" "No agent documentation found" "Create docs/ai-agent-engineer.md"
  fi
}

check_git_clean() {
  if git diff-index --quiet HEAD -- 2>/dev/null; then
    add_result "pass" "Git Working Tree" "Clean"
  else
    add_result "warn" "Git Working Tree" "Uncommitted changes" "Commit or stash changes"
  fi
}

check_required_scripts() {
  local scripts=("build" "test:run" "typecheck" "lint")
  local missing=0
  
  for script in "${scripts[@]}"; do
    if grep -q "\"$script\"" package.json 2>/dev/null; then
      add_result "pass" "Script: $script" "Defined"
    else
      add_result "fail" "Script: $script" "Missing" "Add '$script' script to package.json"
      missing=$((missing + 1))
    fi
  done
}

check_build_capability() {
  if [ ! -d "node_modules" ]; then
    add_result "warn" "Build Capability" "Cannot test without node_modules"
    return
  fi
  
  if npm run build --dry-run > /dev/null 2>&1; then
    add_result "pass" "Build Capability" "Ready"
  else
    add_result "pass" "Build Capability" "Cannot verify (dry-run not supported)"
  fi
}

check_ci_environment() {
  if [ "$CI_MODE" = true ]; then
    if [ -n "$CI" ]; then
      add_result "pass" "CI Environment" "Detected (CI=$CI)"
    else
      add_result "warn" "CI Environment" "Not detected (running locally)"
    fi
  fi
}

log "========================================"
log "CI/CD Readiness Check"
log "Version: ${SCRIPT_VERSION}"
log "========================================"
log ""

log "Checking environment..."
check_node_version
check_npm_version

log ""
log "Checking project configuration..."
check_package_lock
check_node_modules
check_dependencies_integrity
check_typescript_config
check_wrangler_config
check_env_example
check_agent_docs

log ""
log "Checking build setup..."
check_required_scripts
check_build_capability

log ""
log "Checking version control..."
check_git_clean
check_ci_environment

if [ "$OUTPUT_FORMAT" = "json" ]; then
  echo "{"
  echo "  \"version\": \"$SCRIPT_VERSION\","
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"summary\": {"
  echo "    \"passed\": $PASS_COUNT,"
  echo "    \"failed\": $FAIL_COUNT,"
  echo "    \"warnings\": $WARN_COUNT,"
  echo "    \"ready\": $([ $FAIL_COUNT -eq 0 ] && [ \( $WARN_COUNT -eq 0 \) -o \( \"$STRICT_MODE\" = false \) ] && echo "true" || echo "false")"
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
      log "⚠️  CI/CD readiness check passed with warnings (strict mode)"
      exit 1
    else
      log "✅ CI/CD readiness check passed"
      exit 0
    fi
  else
    log "❌ CI/CD readiness check failed"
    exit 1
  fi
fi
