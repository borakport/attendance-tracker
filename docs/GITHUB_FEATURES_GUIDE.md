# GitHub Features & Workflow Guide

**Repository:** https://github.com/borakport/attendance-tracker  
**Last Updated:** 2025-08-28 04:49:09 UTC

This guide explains how to use all the GitHub features we've implemented in this project.

## 🚀 Overview of Implemented Features

We've set up a comprehensive GitHub workflow with:
- ✅ **Automated CI/CD** via GitHub Actions
- ✅ **Issue Templates** for bug reports and features
- ✅ **Pull Request Templates** for consistent reviews
- ✅ **Dependabot** for automatic dependency updates
- ✅ **Branch Protection** for main branch
- ✅ **Code Owners** for automatic reviewer assignment
- ✅ **Security Policies** and automated audits
- ✅ **Release Automation** with tags
- ✅ **Project Management** tools

## 📋 Daily Development Workflow

### 1. Starting a New Feature

```bash
# Get latest changes
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...
git add .
git commit -m "feat: describe your feature"

# Push to GitHub
git push origin feature/your-feature-name
```

### 2. Creating a Pull Request

1. **Go to GitHub**: Navigate to your repository
2. **Create PR**: Click "Compare & pull request"
3. **Use Template**: Fill out the PR template that appears:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [x] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [x] Tests pass locally
   - [x] Added new tests for feature

   ## Checklist
   - [x] Code follows style guidelines
   - [x] Self-review completed
   - [x] Documentation updated
   ```

4. **Assign Reviewers**: GitHub automatically assigns based on CODEOWNERS
5. **Wait for CI**: GitHub Actions will run tests automatically
6. **Merge**: Once approved and CI passes, merge to develop

## 🤖 Automated Workflows (GitHub Actions)

### 1. Continuous Integration (`ci.yml`)

**Triggers:** Every push and pull request

**What it does:**
```yaml
- Installs Node.js 18
- Installs dependencies for all services
- Runs TypeScript compilation check
- Runs linting (ESLint)
- Runs unit tests
- Builds all services
```

**View Results:**
1. Go to your repository
2. Click "Actions" tab
3. See all workflow runs and their status

### 2. Security Audits (`security.yml`)

**Triggers:** Weekly on Mondays, manual dispatch

**What it does:**
```yaml
- Runs npm audit on all services
- Scans for secrets with GitLeaks
- Checks dependencies for vulnerabilities
- Creates issues for security problems
```

### 3. Release Automation (`release.yml`)

**Triggers:** When you push a version tag (like `v1.0.0`)

**What it does:**
```yaml
- Creates GitHub Release
- Builds all services
- Attaches build artifacts
- Generates release notes
```

**How to trigger:**
```bash
# Create and push a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin --tags
```

## 🔄 Dependency Management (Dependabot)

**What it does:**
- Automatically checks for dependency updates weekly
- Creates pull requests for outdated packages
- Groups updates by service and type
- Auto-labels PRs for easy filtering

**Managing Dependabot PRs:**
1. **Review the changes**: Check what's being updated
2. **Check CI**: Ensure tests still pass
3. **Merge if safe**: Simple version bumps are usually safe
4. **Test thoroughly**: Major version updates need more testing

**Example Dependabot PR:**
- Title: "Bump express from 4.18.1 to 4.18.2 in /backend/services/auth-service"
- Label: "dependencies", "javascript"
- Auto-generated description with changelog

## 🐛 Issue Management

### Creating Issues

**Using Templates:**
1. Go to "Issues" → "New Issue"
2. Choose template:
   - **Bug Report** - For reporting problems
   - **Feature Request** - For new functionality
   - **Custom** - For other discussions

**Bug Report Template:**
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What you expected to happen.

## Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.17.0]
```

### Managing Issues

**Labels we use:**
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high/medium/low` - Issue priority

**Milestones:**
- `v0.5-mobile-app` - Mobile development phase
- `v1.0-mvp` - Minimum viable product
- `v2.0-advanced` - Advanced features

## 🏷️ Release Management

### Creating Releases

**Method 1: Automatic (Recommended)**
```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0 with mobile app"

# Push tag (triggers release workflow)
git push origin --tags
```

**Method 2: Manual**
1. Go to "Releases" → "Create a new release"
2. Choose tag (or create new one)
3. Fill in release notes
4. Attach files if needed
5. Publish release

### Release Notes Template
```markdown
## 🚀 What's New
- Added mobile app with GPS attendance
- Real-time notifications
- Improved security

## 🐛 Bug Fixes
- Fixed authentication timeout issue
- Resolved GPS accuracy problems

## 🔧 Technical Changes
- Updated dependencies
- Improved error handling
- Performance optimizations

## 📱 Mobile App
Download the APK from the assets below.

## 🔄 Migration Notes
No breaking changes in this release.
```

## 🛡️ Security Features

### Branch Protection

**Main branch is protected with:**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks (CI must pass)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Allow force pushes: No
- ✅ Allow deletions: No

### Code Owners (CODEOWNERS)

**Automatic reviewer assignment:**
```
# Global
* @borakport

# Backend specific
/backend/ @borakport
/backend/services/auth-service/ @borakport

# Mobile specific
/mobile/ @borakport

# Documentation
/docs/ @borakport
*.md @borakport
```

### Security Policy

**Reporting vulnerabilities:**
1. Check our security policy: `.github/SECURITY.md`
2. Use GitHub Security Advisories for private reporting
3. Email: (if configured)

## 📊 Project Management

### Project Boards

**We use GitHub Projects for:**
- Sprint planning
- Feature tracking
- Bug prioritization

**Columns:**
- 📋 **Backlog** - Future work
- 🔄 **In Progress** - Currently working
- 👀 **Review** - Waiting for review
- ✅ **Done** - Completed

### Milestones

**Current milestones:**
- **v0.4-backend-complete** ✅ (Complete)
- **v0.5-mobile-app** 🔄 (In Progress)
- **v1.0-mvp** 📋 (Planned)

## 🔧 Configuration Files

### Dependabot (`dependabot.yml`)
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend/services/auth-service"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "javascript"
```

### Code Owners (`.github/CODEOWNERS`)
```
* @borakport
/backend/ @borakport
/mobile/ @borakport
```

### Workflows (`.github/workflows/`)
- `ci.yml` - Continuous Integration
- `security.yml` - Security Audits  
- `release.yml` - Release Automation

## 📚 Quick Reference Commands

### Git & GitHub
```bash
# Daily workflow
git checkout develop && git pull origin develop
git checkout -b feature/name
git commit -m "feat: description"
git push origin feature/name

# Releases
git tag -a v1.0.0 -m "Release notes"
git push origin --tags

# Cleanup
git branch -d feature/name
git push origin --delete feature/name
```

### GitHub CLI (Optional)
```bash
# Install GitHub CLI: https://cli.github.com/
gh --version

# Create PR from command line
gh pr create --title "Feature: New awesome feature" --body "Description here"

# List issues
gh issue list

# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"
```

## 🆘 Troubleshooting

### Common Issues

**1. GitHub Actions Failing**
- Check the "Actions" tab for error logs
- Often caused by test failures or linting issues
- Fix locally and push again

**2. PR Can't Be Merged**
- Branch protection rules preventing merge
- CI checks must pass first
- Need reviewer approval

**3. Dependabot PRs Failing**
- Dependency update broke tests
- Check what changed in the update
- May need code updates to work with new version

**4. Can't Push to Main**
- Main branch is protected
- Must use pull requests
- Push to feature branch instead

### Getting Help

**GitHub Documentation:**
- [GitHub Actions](https://docs.github.com/en/actions)
- [Pull Requests](https://docs.github.com/en/pull-requests)
- [Issues](https://docs.github.com/en/issues)
- [Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

**Project Resources:**
- Repository: https://github.com/borakport/attendance-tracker
- Issues: https://github.com/borakport/attendance-tracker/issues
- Actions: https://github.com/borakport/attendance-tracker/actions

---

**💡 Tip:** Bookmark this guide and refer to it when working with GitHub features. All the automation is designed to make your development process smoother and more reliable!
