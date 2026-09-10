@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo IJ Maintenance React V4
echo Installing packages (first run only)...
call npm install
if errorlevel 1 pause & exit /b 1
echo.
echo Starting development server...
call npm run dev
pause
