# Dodaj do swojego profilu PowerShell ($PROFILE)
function Reset-NextJs {
    param(
        [string]$ProjectPath = (Get-Location)
    )
    
    $cleanupScript = Join-Path $ProjectPath "scripts\emergency-cleanup.ps1"
    
    if (Test-Path $cleanupScript) {
        Write-Host "Running emergency cleanup for Next.js project..." -ForegroundColor Cyan
        & $cleanupScript
    } else {
        Write-Host "Emergency cleanup script not found at: $cleanupScript" -ForegroundColor Red
    }
}

# Funkcja do automatycznego czyszczenia i uruchamiania
function Start-NextWithCleanup {
    param(
        [string]$ProjectPath = (Get-Location)
    )
    
    Push-Location $ProjectPath
    try {
        Write-Host "Starting Next.js with automatic cleanup..." -ForegroundColor Cyan
        npm run dev:clean
    }
    finally {
        Pop-Location
    }
}

# Aliasy dla łatwiejszego użycia
Set-Alias -Name "reset-next" -Value Reset-NextJs
Set-Alias -Name "dev-clean" -Value Start-NextWithCleanup
