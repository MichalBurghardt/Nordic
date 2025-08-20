# Nordic GmbH - Git Auto Deploy Script
# This script automatically commits and pushes changes to GitHub

param(
    [string]$Message = "Auto-deploy: Update Nordic GmbH application",
    [switch]$Force = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Nordic GmbH Auto Deploy Script" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy.ps1 [-Message 'commit message'] [-Force] [-Help]" -ForegroundColor White
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -Message    Custom commit message (optional)" -ForegroundColor White
    Write-Host "  -Force      Force push (use with caution)" -ForegroundColor White
    Write-Host "  -Help       Show this help" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1" -ForegroundColor White
    Write-Host "  .\deploy.ps1 -Message 'feat: Add new Nordic features'" -ForegroundColor White
    Write-Host "  .\deploy.ps1 -Force" -ForegroundColor White
    exit 0
}

Write-Host "🚀 Nordic GmbH Auto Deploy Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-Host "✅ No changes to commit. Repository is up to date!" -ForegroundColor Green
    exit 0
}

Write-Host "📋 Found changes:" -ForegroundColor Yellow
git status --short

# Add all changes (excluding .env file for security)
Write-Host "➕ Adding files to git..." -ForegroundColor Yellow
git add .
git reset HEAD .env 2>$null  # Remove .env if accidentally added

# Show what will be committed
Write-Host "📝 Files to be committed:" -ForegroundColor Yellow
git diff --cached --name-only | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }

# Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "$Message`n`nAuto-deployed on: $timestamp"

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow

if ($Force) {
    Write-Host "⚠️  Force pushing..." -ForegroundColor Magenta
    git push origin main --force
} else {
    git push origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Check your repository: https://github.com/MichalBurghardt/Nordic" -ForegroundColor Cyan
    
    # Optional: Open GitHub in browser
    $openGithub = Read-Host "Open GitHub repository in browser? (y/N)"
    if ($openGithub -eq "y" -or $openGithub -eq "Y") {
        Start-Process "https://github.com/MichalBurghardt/Nordic"
    }
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "💡 Try running with -Force flag if you're sure about the changes" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
