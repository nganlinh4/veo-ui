# Veo UI - Automated Video Generation Interface

A user-friendly web application for generating videos using Google's Veo API with **fully automated setup and authentication**.

## 🚀 Quick Start (Recommended)

### For Everyone

1. **Download and extract** this project to your computer
2. **Double-click** `start-app-now.bat`
3. **Wait** for the app to start (installs dependencies automatically)
4. **Browser opens** automatically to http://localhost:3000
5. **Go to Settings tab** and authenticate with Google Cloud
6. **Enter your Google Cloud Project ID**
7. **Start generating videos!**

That's it! One simple script handles everything.

## 📋 What the Script Does

The `start-app-now.bat` script automatically:

- ✅ Checks if Node.js is installed
- ✅ Installs project dependencies (npm install)
- ✅ Checks Google Cloud authentication status
- ✅ Starts the web application
- ✅ Opens your browser automatically
- ✅ Provides clear status messages

## 🔧 Manual Setup (Advanced Users)

If you prefer manual setup or the automatic script doesn't work:

### Prerequisites

1. **Node.js** (v18 or later) - Download from [nodejs.org](https://nodejs.org/)
2. **Google Cloud SDK** - Download from [cloud.google.com/sdk](https://cloud.google.com/sdk/)
3. **Google Cloud Project** with Vertex AI API enabled

### Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Authenticate with Google Cloud
gcloud auth login

# 3. Set your project (optional)
gcloud config set project YOUR_PROJECT_ID

# 4. Start the application
npm run dev
```

### Configuration

1. Open http://localhost:3000
2. Go to the **Settings** tab
3. Enter your **Google Cloud Project ID**
4. The app will automatically retrieve authentication tokens

## 🎯 Features

### Automated Authentication
- **Zero manual token management** - tokens are retrieved automatically
- **Browser-based Google Cloud login** - familiar OAuth flow
- **Automatic token refresh** - no expired token errors
- **Fallback to manual entry** - if automatic auth fails

### Video Generation
- **Text-to-Video** - Generate videos from text descriptions
- **Image-to-Video** - Animate images with text prompts
- **Real-time monitoring** - Track generation progress
- **Video gallery** - View and download completed videos

### User-Friendly Interface
- **Intuitive tabs** - Easy navigation between features
- **Visual status indicators** - Clear authentication status
- **Helpful instructions** - Step-by-step guidance
- **Error handling** - Clear error messages and solutions

## 📁 Project Structure

```
veo-ui/
├── setup-and-run.bat          # Main setup script
├── scripts/
│   └── run-app.bat            # Application runner
├── src/
│   ├── app/
│   │   ├── api/auth/           # Authentication API routes
│   │   ├── layout.tsx          # App layout
│   │   └── page.tsx            # Main page
│   ├── components/             # React components
│   │   ├── settings-panel.tsx  # Auto-auth settings
│   │   ├── text-to-video.tsx   # Text generation
│   │   ├── image-to-video.tsx  # Image animation
│   │   └── ...
│   ├── lib/
│   │   └── veo-api.ts          # API client with auto-auth
│   └── types/
│       └── veo.ts              # TypeScript definitions
└── package.json
```

## 🔐 Authentication Methods

The application supports multiple authentication methods in order of preference:

1. **Automatic (Recommended)** - Uses `gcloud auth login` via the web interface
2. **Environment Variable** - Set `GOOGLE_CLOUD_ACCESS_TOKEN`
3. **Service Account** - Set `GOOGLE_APPLICATION_CREDENTIALS`
4. **Manual Entry** - Enter access token directly in the UI

## 🛠️ Troubleshooting

### "gcloud command not found"
- **Solution**: Restart your computer or reopen your terminal/VSCode after running the setup script
- **Why**: The PATH environment variable needs to be refreshed

### Authentication fails
- **Check**: Make sure you have a Google Cloud account
- **Check**: Ensure your project has the Vertex AI API enabled
- **Try**: Manual authentication with `gcloud auth login` in a terminal

### Setup script doesn't work
- **Try**: Run as administrator manually
- **Try**: Manual installation following the "Manual Setup" section
- **Check**: Your internet connection and antivirus settings

### Application won't start
- **Check**: Node.js is installed (`node --version`)
- **Try**: Delete `node_modules` folder and run `npm install`
- **Check**: Port 3000 is not in use by another application

## 🌐 Environment Variables

Optional environment variables for advanced configuration:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_ACCESS_TOKEN=your-access-token

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
VEO_MODEL_ID=veo-3.0-generate-preview
VEO_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1
```

## 📚 Additional Resources

- [Veo API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/video/overview)
- [Google Cloud Authentication Guide](https://cloud.google.com/docs/authentication/getting-started)
- [Enable Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are met
3. Try the manual setup process
4. Check the browser console for error messages

## 🔄 Updates

To update the application:

1. Download the latest version
2. Replace your files (keep your `.env.local` if you have one)
3. Run `npm install` to update dependencies
4. Restart the application
