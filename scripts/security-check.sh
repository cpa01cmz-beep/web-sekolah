#!/bin/bash

set -e

echo "========================================"
echo "Security Validation Script"
echo "========================================"
echo ""

FOUND_ISSUES=0

check_hardcoded_secrets() {
    echo "Checking for hardcoded secrets..."
    
    if grep -r --include="*.ts" --include="*.tsx" --include="*.js" \
        -E "(password|secret|api_key|apikey|token|auth|credential)\s*[=:]\s*['\"][^'\"]{8,}['\"]" \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=__tests__ . 2>/dev/null; then
        echo "::warning::Potential hardcoded secrets found in source files"
        FOUND_ISSUES=1
    else
        echo "  No hardcoded secrets detected"
    fi
    
    if grep -r --include="*.ts" --include="*.tsx" --include="*.js" \
        -E "-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----" \
        --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null; then
        echo "::error::Private key found in source files"
        FOUND_ISSUES=1
    fi
}

check_env_files() {
    echo ""
    echo "Checking environment file security..."
    
    if [ -f ".env" ]; then
        if git check-ignore .env > /dev/null 2>&1; then
            echo "  .env file is properly gitignored"
        else
            echo "::error::.env file exists but is not in .gitignore!"
            FOUND_ISSUES=1
        fi
    fi
    
    if [ -f ".env.example" ]; then
        echo "  .env.example exists"
        if grep -q "password\|secret\|key" .env.example 2>/dev/null; then
            if grep -E "=.*[a-zA-Z0-9]{16,}" .env.example 2>/dev/null; then
                echo "::warning::.env.example may contain actual values instead of placeholders"
            fi
        fi
    else
        echo "::warning::.env.example file not found"
    fi
}

check_gitignore() {
    echo ""
    echo "Checking .gitignore for sensitive patterns..."
    
    PATTERNS=(".env" "*.pem" "*.key" "credentials.json" "secrets.json" "*.p12" "*.pfx")
    
    for pattern in "${PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore 2>/dev/null; then
            echo "  $pattern is properly ignored"
        else
            echo "::warning::$pattern may not be in .gitignore"
        fi
    done
}

check_npm_audit() {
    echo ""
    echo "Running npm audit..."
    
    if command -v npm &> /dev/null; then
        if npm audit --audit-level=moderate 2>/dev/null; then
            echo "  No moderate+ vulnerabilities found"
        else
            echo "::warning::npm audit found vulnerabilities (may be dev dependencies)"
        fi
    else
        echo "::warning::npm not found, skipping audit"
    fi
}

check_dependencies() {
    echo ""
    echo "Checking for known vulnerable packages..."
    
    if [ -f "package-lock.json" ]; then
        echo "  package-lock.json exists (good for dependency locking)"
    else
        echo "::warning::package-lock.json not found"
    fi
}

check_security_headers() {
    echo ""
    echo "Checking for security headers configuration..."
    
    if grep -r "Content-Security-Policy\|Strict-Transport-Security\|X-Frame-Options" \
        --include="*.ts" --include="*.tsx" \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=__tests__ . 2>/dev/null | head -1 > /dev/null; then
        echo "  Security headers configuration found"
    else
        echo "::warning::No security headers configuration detected"
    fi
}

check_hardcoded_secrets
check_env_files
check_gitignore
check_npm_audit
check_dependencies
check_security_headers

echo ""
echo "========================================"
if [ $FOUND_ISSUES -eq 0 ]; then
    echo "Security validation passed"
    exit 0
else
    echo "Security validation completed with warnings"
    exit 1
fi
