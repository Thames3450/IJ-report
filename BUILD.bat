@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo IJ Maintenance React V4 - Production Build
call npm install
if errorlevel 1 pause & exit /b 1
call npm run build
if errorlevel 1 pause & exit /b 1
echo.
echo Build complete. Upload the dist folder to your hosting.
pause
