@echo off
chcp 65001 >nul
cls
echo ========================================
echo IJ Maintenance - GitHub Setup
echo ========================================
echo.
echo 1. Create a new repository on GitHub first.
echo 2. Copy its HTTPS URL, for example:
echo    https://github.com/USERNAME/ij-maintenance.git
echo.
set /p REPO=Paste GitHub repository URL: 
if "%REPO%"=="" goto :eof

git init
git add .
git commit -m "Initial IJ Maintenance V6"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO%
git push -u origin main

echo.
echo Done. Open GitHub Settings ^> Pages and select GitHub Actions.
pause
