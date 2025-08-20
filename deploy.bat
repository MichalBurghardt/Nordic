@echo off
echo 🚀 Nordic GmbH - Quick Deploy
echo ============================

REM Add all files except .env
git add .
git reset HEAD .env 2>nul

REM Commit with timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
git commit -m "Auto-deploy %mydate% %mytime%"

REM Push to GitHub
git push origin main

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
) else (
    echo ❌ Deployment failed!
)

pause
