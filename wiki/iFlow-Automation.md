# iFlow Automation

This document provides detailed information about the iFlow CLI automation implemented in the Akademia Pro repository.

## Overview

iFlow CLI automation streamlines development workflows by automating common tasks such as issue implementation, pull request review, documentation updates, and maintenance. The automation is powered by GitHub Actions workflows that integrate with the iFlow CLI.

## Workflows

### Main Automation Workflow (iflow.yml)

Located at `.github/workflows/iflow.yml`, this workflow handles:

1. **Issue Automation**: Automatically implements solutions for new issues and opens PRs
2. **PR Review**: Reviews pull requests for code quality, security, and performance
3. **Documentation Updates**: Updates documentation when changes are merged to main
4. **Maintenance**: Performs scheduled maintenance tasks to keep dependencies up to date
5. **Failure Notification**: Creates issues when workflows fail

### Intelligence Workflow (iflow-inteligent.yml)

Located at `.github/workflows/iflow-inteligent.yml`, this workflow runs weekly to:

1. **Gather Repository Intelligence**: Collects data about GitHub Actions runs, open issues, and PR history
2. **Analyze Codebase**: Identifies bugs, inefficiencies, and improvement opportunities
3. **Create Issues**: Automatically creates GitHub issues for findings
4. **Suggest Improvements**: Proposes workflow and configuration improvements

### OpenCode Workflow (opencode.yml)

Located at `.github/workflows/opencode.yml`, this workflow enables:

1. **AI-Assisted Development**: Natural language commands for code generation and modification
2. **Interactive Development**: Real-time collaboration with AI assistants

## Interactive Commands

### Issue Commands

- `@iflow-cli /solve` - Trigger automated implementation for an issue
- `@iflow-cli /plan` - Get a plan for implementing an issue without executing

### Pull Request Commands

- `@iflow-cli /review` - Request an additional review for a PR
- `@iflow-cli /apply` - Automatically apply review feedback

### OpenCode Commands

- `/opencode` or `/oc` - Trigger AI-assisted development
- `/opencode <prompt>` - Execute a specific OpenCode command

## Configuration

The workflows are configured with the following permissions:

- `contents: write` - To push changes and create branches
- `pull-requests: write` - To create and update pull requests
- `issues: write` - To create and update issues
- `actions: read` - To access workflow information

## Secrets Required

- `IFLOW_API_KEY` - API key for iFlow CLI
- `GH_TOKEN` - GitHub token with appropriate permissions

## Best Practices

1. **Issue Creation**: Create clear, specific issues to get the best automated implementation
2. **PR Descriptions**: Provide detailed descriptions to help iFlow understand context
3. **Review Feedback**: Be specific with feedback when requesting changes
4. **Monitoring**: Regularly check automated issues and PRs for accuracy

## Troubleshooting

If automation fails:

1. Check the GitHub Actions logs for error messages
2. Ensure required secrets are properly configured
3. Verify that the issue/PR has sufficient context for automation
4. Manually implement if automation continues to fail

For persistent issues, create a bug report with the workflow logs and error details.