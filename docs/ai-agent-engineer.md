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
