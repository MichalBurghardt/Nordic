# PowerShell emergency cleanup script for Next.js development environment
# This script will forcefully remove the .next directory and kill any processes using port 3000

Write-Host "Starting emergency cleanup for Next.js development environment..." -ForegroundColor Cyan

# Define paths
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$nextDir = Join-Path $projectRoot ".next"

# Step 1: Kill processes using port 3000
Write-Host "Killing processes on ports 3000-3003..." -ForegroundColor Yellow
$ports = 3000..3003

foreach ($port in $ports) {
    $processInfo = netstat -ano | findstr ":$port " | findstr "LISTENING"
    
    if ($processInfo) {
        try {
            $processId = ($processInfo -split ' ')[-1]
            Write-Host "Found process using port $port with PID: $processId" -ForegroundColor Yellow
            taskkill /F /PID $processId
            Write-Host "Successfully killed process with PID: $processId" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to kill process on port $port $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "No process found using port $port" -ForegroundColor Green
    }
}

# Also try kill-port as a fallback
try {
    Write-Host "Using kill-port to ensure ports are free..." -ForegroundColor Yellow
    npx kill-port 3000 3001 3002 3003
}
catch {
    # Ignore kill-port errors
}

# Step 2: Clean .next directory
if (Test-Path $nextDir) {
    Write-Host "Removing .next directory at: $nextDir" -ForegroundColor Yellow
    
    # Try different methods to remove the directory
    try {
        # Method 1: Remove-Item
        Remove-Item -Path $nextDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    catch {
        Write-Host "Standard removal failed, trying alternative methods..." -ForegroundColor Yellow
    }
    
    # Check if removal was successful
    if (Test-Path $nextDir) {
        Write-Host "Standard removal failed, trying rimraf..." -ForegroundColor Yellow
        
        # Method 2: Try using rimraf
        try {
            npx rimraf $nextDir
        }
        catch {
            Write-Host "Rimraf removal failed: $_" -ForegroundColor Red
        }
    }
    
    # Method 3: Last resort - use cmd's rd command for stubborn directories
    if (Test-Path $nextDir) {
        Write-Host "Trying forceful cmd removal..." -ForegroundColor Yellow
        
        try {
            cmd /c "rd /s /q `"$nextDir`""
        }
        catch {
            Write-Host "Forceful removal failed: $_" -ForegroundColor Red
        }
    }
    
    # Final check
    if (Test-Path $nextDir) {
        Write-Host "WARNING: Failed to remove .next directory!" -ForegroundColor Red
        Write-Host "Try restarting your computer and running this script again." -ForegroundColor Red
    }
    else {
        Write-Host "Successfully removed .next directory!" -ForegroundColor Green
    }
}
else {
    Write-Host ".next directory does not exist - already clean!" -ForegroundColor Green
}

# Step 3: Clear temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow

# Node modules cache
$cachePath = Join-Path $projectRoot "node_modules/.cache"
if (Test-Path $cachePath) {
    try {
        Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleared Node.js module cache" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to clear module cache: $_" -ForegroundColor Red
    }
}

# Next.js temporary files in system temp
$tempNextFiles = Join-Path $env:TEMP "next-*"
try {
    Remove-Item -Path $tempNextFiles -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cleared Next.js temporary files from system temp directory" -ForegroundColor Green
}
catch {
    # Ignore errors for temp files
}

Write-Host "Emergency cleanup complete!" -ForegroundColor Cyan
Write-Host "You can now run 'npm run dev' to start the development server." -ForegroundColor Cyan
