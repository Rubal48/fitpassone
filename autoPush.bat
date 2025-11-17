@echo off
cd /d "%~dp0"

:: Check if git exists
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not recognized. Please install Git or add it to PATH.
    pause
    exit /b
)

:: Stage all changes
git add .

:: Commit with timestamp
git commit -m "Auto update on %date% %time%"

:: Push
git push

echo.
echo ✅ Auto-push complete! Check your GitHub repo.
pause
