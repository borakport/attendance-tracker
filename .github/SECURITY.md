# Security Policy

## Supported Versions

Currently supporting the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously in the GPS Attendance Tracker project.

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: borakport@example.com
3. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the issue
   - Location of the affected source code
   - Step-by-step instructions to reproduce
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue

### What to Expect

- Acknowledgment within 48 hours
- Regular updates on the progress
- Credit in release notes (if desired)

### Security Best Practices for Contributors

- Keep dependencies up to date
- Use environment variables for sensitive data
- Never commit secrets to the repository
- Follow secure coding guidelines
- Run security audits regularly: `npm audit`
