@echo off
echo.
echo ========================================
echo DevHub Full-Stack Platform - Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm version:
npm --version
echo.

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed
    echo Install Docker to easily run databases
    echo You can still run with local databases
) else (
    echo [OK] Docker is installed
)

echo.
echo ========================================
echo Installing Dependencies...
echo ========================================
echo.

REM Install root dependencies
call npm install

REM Install workspace dependencies
call npm run install:all

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Copy .env.example to .env and configure
echo 2. Start databases: npm run docker:dev
echo 3. Start all services: npm run dev
echo.
echo Documentation:
echo - Setup Guide: docs\SETUP.md
echo - Quick Reference: docs\QUICK_REFERENCE.md
echo - Architecture: docs\ARCHITECTURE.md
echo.
echo Services will run on:
echo - Frontend: http://localhost:3000
echo - API Gateway: http://localhost:4000
echo - Auth Service: http://localhost:4001
echo.
echo Happy Coding! 
echo.
pause
