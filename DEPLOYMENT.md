# Nordic GmbH - Deployment Scripts

This folder contains automated deployment scripts for the Nordic GmbH application.

## Available Scripts

### 1. `deploy.ps1` (PowerShell - Recommended)
**Full-featured deployment script with options**

```powershell
# Basic deployment
.\deploy.ps1

# Custom commit message
.\deploy.ps1 -Message "feat: Add new Nordic dashboard features"

# Force push (use carefully)
.\deploy.ps1 -Force

# Show help
.\deploy.ps1 -Help
```

**Features:**
- ✅ Automatic git status check
- ✅ Excludes .env file for security
- ✅ Custom commit messages
- ✅ Timestamp in commits
- ✅ Force push option
- ✅ GitHub repository opener
- ✅ Colored output

### 2. `quick-deploy.ps1` (PowerShell - Simple)
**One-click deployment without options**

```powershell
.\quick-deploy.ps1
```

### 3. `deploy.bat` (Batch File)
**For users who prefer .bat files**

```cmd
deploy.bat
```

## Security Features

- 🔒 **Automatically excludes `.env` file** - prevents committing sensitive data
- 🔍 **Git status check** - shows what will be committed
- ⏰ **Automatic timestamping** - tracks when changes were deployed

## Usage Examples

### Regular Development Workflow
```powershell
# Make your changes to the code
# Then deploy:
.\deploy.ps1 -Message "fix: Improve Nordic authentication system"
```

### Quick Updates
```powershell
# For small fixes or updates:
.\quick-deploy.ps1
```

### Emergency Deployment
```powershell
# If you need to override conflicts:
.\deploy.ps1 -Force -Message "hotfix: Critical Nordic security update"
```

## Prerequisites

- Git must be installed and configured
- Repository must be connected to GitHub
- PowerShell execution policy must allow script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

## Troubleshooting

### "Execution Policy" Error
Run this command first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Not in a git repository" Error
Make sure you're in the Nordic project folder:
```powershell
cd C:\webapps\nordic
```

### Push Conflicts
Use the force option (be careful):
```powershell
.\deploy.ps1 -Force
```

---

**Happy deploying! 🚀**
