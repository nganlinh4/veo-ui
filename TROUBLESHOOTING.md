# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Setup Script Hangs at Authentication Phase

**Problem**: The setup script shows "Phase 2: Setting up authentication..." and then nothing happens.

**Solutions**:

#### Option A: Use Quick Start Instead
1. Close the current script (press Ctrl+C or close window)
2. Double-click **`quick-start.bat`** instead
3. This skips the authentication setup and goes straight to the app
4. Authenticate later through the web interface

#### Option B: Manual Authentication
1. Open a new Command Prompt or PowerShell
2. Run: `gcloud auth login`
3. Complete the authentication in your browser
4. Then run **`quick-start.bat`**

#### Option C: Skip Authentication in Setup
1. When the setup script asks for authentication method
2. Choose option **[3] Skip authentication**
3. The app will start and you can authenticate through the web interface

### 2. "gcloud command not found" Error

**Problem**: The system can't find the gcloud command.

**Solutions**:
1. **Restart your computer** (most common fix)
2. **Reopen your terminal/command prompt**
3. **Check if Google Cloud SDK is installed**:
   - Look for "Google Cloud SDK Shell" in your Start Menu
   - If not found, run the full setup script again

### 3. Authentication Fails in Browser

**Problem**: Browser opens but authentication doesn't complete.

**Solutions**:
1. **Make sure you're signed into the correct Google account**
2. **Check if you have a Google Cloud account** (different from regular Gmail)
3. **Try incognito/private browsing mode**
4. **Clear browser cookies** for accounts.google.com

### 4. No Google Cloud Project

**Problem**: You don't have a Google Cloud project set up.

**Solutions**:
1. **Create a project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Give it a name and create it
2. **Enable Vertex AI API**:
   - In your project, go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

### 5. App Starts But Shows Authentication Errors

**Problem**: The web app loads but can't authenticate.

**Solutions**:
1. **Go to the Settings tab** in the web app
2. **Click "Authenticate with Google Cloud"** button
3. **Or enter credentials manually**:
   - Run `gcloud auth print-access-token` in terminal
   - Copy the token and paste it in the app

### 6. Port 3000 Already in Use

**Problem**: Error says port 3000 is already in use.

**Solutions**:
1. **Close other applications** using port 3000
2. **Kill existing Node.js processes**:
   - Press Ctrl+Shift+Esc to open Task Manager
   - Look for "Node.js" processes and end them
3. **Use a different port**:
   - Edit the start command to use port 3001: `npm run dev -- --port 3001`

## Quick Fixes Summary

### If setup script hangs:
```bash
# Just run this instead:
quick-start.bat
```

### If gcloud not found:
```bash
# Restart computer, then:
quick-start.bat
```

### If authentication fails:
```bash
# Manual auth:
gcloud auth login
# Then:
quick-start.bat
```

### If no project:
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create new project
3. Enable Vertex AI API
4. Use project ID in the app

## Alternative Startup Methods

### Method 1: Command Line
```bash
npm install
npm run dev
```

### Method 2: Quick Start Script
```bash
quick-start.bat
```

### Method 3: Full Setup (if needed)
```bash
setup-and-run.bat
```

## Getting Help

### Check Your Setup
1. **Node.js installed?** Run: `node --version`
2. **Google Cloud SDK installed?** Run: `gcloud --version`
3. **Authenticated?** Run: `gcloud auth list`
4. **Project set?** Run: `gcloud config get-value project`

### Manual Authentication Steps
```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. List your projects
gcloud projects list

# 3. Set your project
gcloud config set project YOUR_PROJECT_ID

# 4. Get access token
gcloud auth print-access-token
```

### Web App Authentication
1. Open http://localhost:3000
2. Go to Settings tab
3. Check authentication status
4. Use "Authenticate with Google Cloud" button
5. Or enter project ID and token manually

## Still Having Issues?

1. **Check the browser console** (F12) for error messages
2. **Verify your Google Cloud project** has Vertex AI API enabled
3. **Try the manual authentication steps** above
4. **Use the quick-start script** instead of full setup
5. **Restart your computer** to refresh environment variables

The app is designed to work even if the initial setup has issues - you can always authenticate through the web interface!
