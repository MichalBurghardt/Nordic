# Quick port cleanup script
Write-Host "Cleaning ports 3000-3003..." -ForegroundColor Cyan

$ports = 3000..3003

foreach ($port in $ports) {
    $processInfo = netstat -ano | findstr ":$port " | findstr "LISTENING"
    
    if ($processInfo) {
        try {
            $processId = ($processInfo -split ' ')[-1]
            Write-Host "Killing process on port $port (PID: $processId)" -ForegroundColor Yellow
            taskkill /F /PID $processId 2>$null
            Write-Host "Port $port freed" -ForegroundColor Green
        }
        catch {
            Write-Host "Could not kill process on port $port" -ForegroundColor Red
        }
    }
}

# Use kill-port as backup
try {
    npx kill-port 3000 3001 3002 3003 2>$null
    Write-Host "kill-port completed" -ForegroundColor Green
}
catch {
    # Ignore errors
}

Write-Host "Port cleanup completed!" -ForegroundColor Cyan
