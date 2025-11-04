@echo off
cd /d D:\fitpassone\fitpass-one

:: Check if git is working
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not recognized. Please install Git or add it to PATH.
    pause
    exit /b
)

:: Add all files
git add .

:: Commit with timestamp
git commit -m "Auto update on %date% %time%"

:: Push to GitHub
git push

echo.
echo ✅ Auto-push complete! Check your GitHub repo.
pause
