# Quick Deploy Script for Nordic GmbH
# Simple one-liner to push changes to GitHub

Write-Host "🚀 Quick Deploy - Nordic GmbH" -ForegroundColor Cyan

# Add all files except .env
git add .
git reset HEAD .env 2>$null

# Quick commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Quick update - $timestamp"

# Push to GitHub
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}
