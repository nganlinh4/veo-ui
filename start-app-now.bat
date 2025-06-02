@echo off
setlocal enabledelayedexpansion

:: Veo UI - Simple Starter
:: This is the ONLY batch file you need to run the application

echo.
echo ========================================
echo    🚀 Veo UI - Video Generation App
echo ========================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorLevel% neq 0 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully!
    echo.
)

:: Check Google Cloud SDK (optional)
where gcloud >nul 2>&1
if %errorLevel% == 0 (
    echo 🔍 Checking Google Cloud authentication...
    gcloud auth list --filter=status:ACTIVE --format="value(account)" >temp_auth.txt 2>&1
    for /f %%i in (temp_auth.txt) do (
        if not "%%i"=="" (
            echo ✅ Authenticated as: %%i
        )
    )
    del temp_auth.txt >nul 2>&1
) else (
    echo ⚠️  Google Cloud SDK not found - you'll need to authenticate manually in the app
)

echo.
echo 🚀 Starting Veo UI...
echo ========================================
echo.
echo 🌐 The app will be available at: http://localhost:3000
echo 🛑 Press Ctrl+C to stop the server
echo 📱 Keep this window open while using the app
echo.

:: Open browser first (before starting server)
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ✅ Browser opened! Starting development server...
echo.
echo 🌐 Web App: http://localhost:3000
echo 🖥️  Server: Running in this window
echo.
echo ⚠️  DO NOT CLOSE THIS WINDOW - it will stop the server
echo 🛑 To stop: Press Ctrl+C
echo.
echo ========================================

:: Start the development server in foreground (this keeps the window open)
npm run dev

echo.
echo 📴 Server stopped.
pause
