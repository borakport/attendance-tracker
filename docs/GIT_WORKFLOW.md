# Git Workflow & GitHub Integration

## Repository Structure

```
attendance-tracker/
├── .github/                  # GitHub-specific configuration
│   ├── workflows/            # GitHub Actions CI/CD
│   │   ├── ci.yml           # Continuous Integration
│   │   ├── security.yml     # Security audits
│   │   └── release.yml      # Release automation
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── pull_request_template.md
│   ├── dependabot.yml       # Automated dependency updates
│   ├── CODEOWNERS           # Code ownership definition
│   ├── FUNDING.yml          # Sponsorship configuration
│   └── SECURITY.md          # Security policy
├── backend/                  # Backend services
├── mobile/                   # Mobile application
├── docs/                     # Project documentation
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
├── README.md                # Project overview
└── CONTRIBUTING.md          # Contribution guidelines
```

## Initial Setup

### 1. Initialize Repository
```bash
# Navigate to project root
cd attendance-tracker

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial project setup with GitHub configuration"
```

### 2. Create GitHub Repository
Go to https://github.com/new and create a new repository:
- Repository name: `attendance-tracker`
- Description: `GPS-based attendance tracking system with real-time updates`
- Public/Private: Your choice
- DO NOT initialize with README, .gitignore, or License

### 3. Connect and Push
```bash
# Add remote origin
git remote add origin https://github.com/borakport/attendance-tracker.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Create Development Branch
```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch
git push -u origin develop
```

### 5. Configure GitHub Repository

#### Set Default Branch
1. Go to Settings → Branches
2. Change default branch to `develop`

#### Enable Branch Protection
1. Go to Settings → Branches
2. Add protection rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

#### Enable GitHub Actions
Actions are automatically enabled when `.github/workflows/` is pushed

#### Configure Secrets
Go to Settings → Secrets → Actions and add:
- `NPM_TOKEN` (if publishing packages)
- `DOCKER_USERNAME` (for Docker Hub)
- `DOCKER_PASSWORD` (for Docker Hub)

## GitHub Features

### Automated Workflows

#### 1. Continuous Integration (ci.yml)
- Runs on every push and PR
- Tests backend services
- Runs linting
- Checks TypeScript compilation

#### 2. Security Audits (security.yml)
- Weekly security scans
- npm audit on all services
- GitLeaks secret scanning

#### 3. Release Automation (release.yml)
- Triggers on version tags (v*)
- Creates GitHub releases
- Builds and attaches artifacts

### Dependabot
Automatically creates PRs for dependency updates:
- Weekly checks for all services
- Grouped by ecosystem
- Auto-labeled for easy tracking

### Issue Templates
Standardized templates for:
- Bug reports
- Feature requests
- Custom issues

### Code Owners
Automatically assigns reviewers based on file changes

## Working with GitHub

### Daily Workflow
```bash
# Start your day
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### Creating Pull Requests

1. Push your branch to GitHub
2. Go to the repository on GitHub
3. Click "Compare & pull request"
4. Fill in the PR template:
   - Describe changes
   - Link related issues
   - Check the checklist
5. Request reviewers
6. Wait for CI checks to pass

### Reviewing Pull Requests

1. Go to Pull Requests tab
2. Select PR to review
3. Review changes:
   - Comment on specific lines
   - Suggest changes
   - Approve or request changes
4. Ensure CI passes before merging

### Merging Strategies

#### Feature to Develop
Use "Squash and merge" for clean history

#### Develop to Main
Use "Create a merge commit" to preserve history

#### Hotfix to Main
Use "Create a merge commit" and then merge back to develop

## Release Process

### Creating a Release

1. **Update version**
   ```bash
   # Update package.json versions
   npm version patch/minor/major
   ```

2. **Create release branch**
   ```bash
   git checkout -b release/1.0.0
   ```

3. **Create PR to main**
   - Review all changes
   - Ensure all tests pass
   - Get approval from team

4. **Tag and Release**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

5. **GitHub Release**
   - Automatically created by release.yml workflow
   - Add release notes
   - Attach binaries if needed

## GitHub CLI Commands

Install GitHub CLI for easier workflow:

### Windows (PowerShell as Admin)
```powershell
winget install --id GitHub.cli
# or
choco install gh
```

### Usage Examples
```bash
# Authenticate
gh auth login

# Create PR
gh pr create --title "feat: new feature" --body "Description"

# List PRs
gh pr list

# Check PR status
gh pr status

# Merge PR
gh pr merge --squash

# Create issue
gh issue create --title "Bug: something broken"

# List issues
gh issue list --label bug
```

## Troubleshooting

### GitHub Actions Failing

1. Check workflow logs in Actions tab
2. Common issues:
   - Missing secrets
   - Node version mismatch
   - Database connection issues

### PR Merge Conflicts

```bash
# Update your branch
git checkout feature/your-branch
git pull origin develop
git merge develop

# Resolve conflicts manually
# Then commit
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### Reset to Remote
```bash
git fetch origin
git reset --hard origin/develop
```

## Security Best Practices

1. **Never commit secrets**
   - Use GitHub Secrets for CI/CD
   - Keep .env files in .gitignore

2. **Enable 2FA**
   - Go to Settings → Security
   - Enable two-factor authentication

3. **Regular Updates**
   - Merge Dependabot PRs promptly
   - Run security audits locally

4. **Sign Commits (Optional)**
   ```bash
   # Configure GPG signing
   git config --global user.signingkey YOUR_KEY
   git config --global commit.gpgsign true
   ```

## Useful Resources

- [GitHub Docs](https://docs.github.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub CLI](https://cli.github.com)
- [Conventional Commits](https://www.conventionalcommits.org)

---

**Author:** borakport  
**Date:** 2025-08-26  
**Version:** 1.0.0