# AI Agent Engineer

## Overview

The AI Agent Engineer domain focuses on automation, developer experience improvements, and tooling that enhances the development and deployment workflow.

## Responsibilities

- CI/CD automation and improvements
- Developer tooling and script enhancements
- Automation of repetitive development tasks
- Monitoring and observability improvements
- Cross-agent coordination and documentation

## Standards

### PR Requirements

- Label: `ai-agent-engineer`
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- Zero warnings
- Small atomic diff

### Process

1. **INITIATE** - Check for existing PRs with label
2. **PLAN** - Identify improvements within domain
3. **IMPLEMENT** - Make targeted changes
4. **VERIFY** - Run validation scripts
5. **SELF-REVIEW** - Review own process
6. **SELF EVOLVE** - Learn and improve
7. **DELIVER** - Create PR

## Scripts

Key automation scripts in `/scripts/`:

- `ci-readiness.sh` - Validates local environment for CI/CD
- `pre-deploy-check.sh` - Runs pre-deployment validation
- `health-check.sh` - Deployment health verification
- `deployment-config-validator.sh` - Configuration validation

## Best Practices

- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Focus on small, measurable improvements
- Prioritize safety and reversibility
- Document changes clearly

## Process Learnings

### INITIATE Phase

- Always check for existing PRs with ai-agent-engineer label first
- If PR exists and changes are already in main, close as stale
- No issues = do proactive scan of domain area

### Implementation Notes

- When adding CLI flags to scripts, always support both long (--help) and short (-h) forms for consistency
- pre-deploy-check.sh serves as the reference implementation for flag handling
- Run `npm run validate` before creating PR (typecheck + lint + test:run)

### Test Coverage Improvements

- Issue #1318: Added WebhookService crypto tests for generateSignature and verifySignature functions
- Added 8 new tests for cryptographic operations
- Tests verify signature generation, validation, and rejection of invalid/tampered signatures
- Removed complex entity mocks that didn't work; kept simple direct imports for crypto functions
