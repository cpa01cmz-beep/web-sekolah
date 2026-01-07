# Contribution Guidelines

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under Issues.
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue with a clear title and detailed description of the proposed enhancement.
- Provide examples of how the enhancement would be used.
- Explain why this enhancement would be useful to most users.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Create a feature branch:
   ```
   git checkout -b feature/your-feature-name
   ```

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Style Guide

- Follow the existing code style in the project
- Use TypeScript for all new code
- Write clear, descriptive variable and function names
- Comment complex logic
- Write unit tests for new functionality

### Documentation Style Guide

- Use Markdown for documentation
- Follow the existing documentation structure
- Keep documentation up to date with code changes
- Use clear, concise language

## Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting a pull request
- Include both positive and negative test cases
- Test edge cases and error conditions

## Code Review Process

- All submissions require review by at least one project maintainer
- Maintainers will review code for style, correctness, and performance
- Address all review comments before merging
- Squash and merge pull requests after approval

## Community

- Be respectful and inclusive in all interactions
- Provide constructive feedback
- Help others in the community
- Share knowledge and best practices
