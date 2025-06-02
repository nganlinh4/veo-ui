# Veo Video Generator - Project Structure

This document outlines the complete structure of the Veo Video Generator application.

## Root Directory Structure

```
veo-ui/
├── .env.example                 # Environment variables template
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── .next/                      # Next.js build output
├── components.json             # shadcn/ui configuration
├── DEPLOYMENT.md               # Deployment guide
├── eslint.config.mjs           # ESLint configuration
├── how-to-use-veo-api.md       # Original Veo API documentation
├── next-env.d.ts               # Next.js TypeScript declarations
├── next.config.ts              # Next.js configuration
├── node_modules/               # Dependencies
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Dependency lock file
├── postcss.config.mjs          # PostCSS configuration
├── PROJECT_STRUCTURE.md        # This file
├── public/                     # Static assets
├── README.md                   # Main documentation
├── src/                        # Source code
└── tsconfig.json               # TypeScript configuration
```

## Source Code Structure (`src/`)

```
src/
├── app/                        # Next.js App Router
│   ├── favicon.ico            # Application icon
│   ├── globals.css            # Global styles with shadcn/ui
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Main page (renders VideoGenerator)
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx         # Button component
│   │   ├── card.tsx           # Card components
│   │   ├── input.tsx          # Input component
│   │   ├── label.tsx          # Label component
│   │   └── textarea.tsx       # Textarea component
│   ├── image-to-video.tsx     # Image-to-video generation form
│   ├── operation-monitor.tsx  # Job status monitoring
│   ├── settings-panel.tsx     # Configuration panel
│   ├── text-to-video.tsx      # Text-to-video generation form
│   ├── video-gallery.tsx      # Generated videos display
│   └── video-generator.tsx    # Main application container
├── lib/                       # Utility libraries
│   ├── utils.ts               # Utility functions (cn helper)
│   └── veo-api.ts             # Veo API client
└── types/                     # TypeScript type definitions
    └── veo.ts                 # Veo API types and interfaces
```

## Key Components Description

### Main Application (`video-generator.tsx`)
- **Purpose**: Main application container with tab navigation
- **Features**: Tab management, job state management, API client handling
- **Tabs**: Text-to-Video, Image-to-Video, Monitor, Gallery, Settings

### Text-to-Video (`text-to-video.tsx`)
- **Purpose**: Generate videos from text prompts
- **Features**: Text input, parameter configuration, job creation
- **Parameters**: Sample count, duration, storage URI, prompt enhancement

### Image-to-Video (`image-to-video.tsx`)
- **Purpose**: Generate videos from images with optional text
- **Features**: Image upload, preview, validation, base64 conversion
- **Supported**: JPEG/PNG, 720p+, 16:9 or 9:16 aspect ratio

### Operation Monitor (`operation-monitor.tsx`)
- **Purpose**: Track video generation job status
- **Features**: Real-time polling, manual status checks, error handling
- **States**: Pending, Running, Completed, Failed

### Video Gallery (`video-gallery.tsx`)
- **Purpose**: Display and manage generated videos
- **Features**: Video playback, download, Cloud Storage links
- **Formats**: MP4 download, in-browser playback

### Settings Panel (`settings-panel.tsx`)
- **Purpose**: Configure Google Cloud integration
- **Features**: Project ID input, access token management, help links
- **Validation**: Connection status, setup instructions

## API Integration (`veo-api.ts`)

### VeoApiClient Class
- **Methods**:
  - `generateVideo()`: Submit video generation requests
  - `checkOperationStatus()`: Check job status
  - `pollOperationUntilComplete()`: Automatic polling
- **Authentication**: Google Cloud access tokens
- **Endpoints**: Vertex AI Veo API

### Utility Functions
- `convertImageToBase64()`: Image processing for API
- `validateImageFile()`: File type validation
- `generateJobId()`: Unique job identifiers

## Type Definitions (`veo.ts`)

### Core Types
- `VeoConfig`: API configuration
- `VeoRequest`: API request structure
- `VeoOperation`: API response structure
- `VeoGenerationJob`: Application job state
- `VeoVideo`: Generated video data

### Constants
- `VEO_MODEL_ID`: Current model version
- `VEO_ENDPOINT`: API base URL

## Styling and UI

### Tailwind CSS
- **Configuration**: Custom design system
- **Components**: shadcn/ui integration
- **Responsive**: Mobile-first design
- **Theme**: Light/dark mode support

### shadcn/ui Components
- **Style**: New York variant
- **Icons**: Lucide React
- **Accessibility**: Radix UI primitives
- **Customization**: CSS variables

## Configuration Files

### Next.js (`next.config.ts`)
- **Features**: Turbopack, optimizations
- **Images**: Domain configuration
- **API**: Route handling

### TypeScript (`tsconfig.json`)
- **Target**: ES2017
- **Module**: ESNext
- **Strict**: Type checking enabled
- **Paths**: Import aliases (@/*)

### ESLint (`eslint.config.mjs`)
- **Extends**: Next.js recommended
- **Rules**: TypeScript, React hooks
- **Plugins**: Import, accessibility

## Development Workflow

### Available Scripts
```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code linting
```

### Development Server
- **URL**: http://localhost:3000
- **Hot Reload**: Automatic updates
- **Turbopack**: Fast bundling

## Deployment Options

### Vercel (Recommended)
- **Setup**: GitHub integration
- **Environment**: Variables configuration
- **Domain**: Custom domain support

### Docker
- **Dockerfile**: Multi-stage build
- **Image**: Node.js Alpine
- **Production**: Optimized runtime

### Google Cloud Run
- **Integration**: Native GCP support
- **Scaling**: Automatic
- **Authentication**: Service accounts

## Environment Variables

### Required
- `GOOGLE_CLOUD_PROJECT_ID`: GCP project
- `GOOGLE_CLOUD_ACCESS_TOKEN`: API authentication

### Optional
- `DEFAULT_STORAGE_URI`: Cloud Storage bucket
- `VEO_MODEL_ID`: Model version override
- `VEO_ENDPOINT`: API endpoint override

## Security Considerations

### Authentication
- **Tokens**: Short-lived access tokens
- **Service Accounts**: Production recommendation
- **Permissions**: Minimal required scope

### Data Handling
- **Images**: Client-side base64 encoding
- **Videos**: Secure download/streaming
- **Storage**: Optional Cloud Storage integration

## Performance Optimizations

### Frontend
- **Bundling**: Turbopack for fast builds
- **Images**: Next.js Image optimization
- **Code Splitting**: Automatic route-based

### API
- **Polling**: Configurable intervals
- **Error Handling**: Retry mechanisms
- **Caching**: Response optimization

## Browser Compatibility

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Features Used
- **ES2017**: Modern JavaScript
- **Fetch API**: HTTP requests
- **FileReader**: Image processing
- **Video Element**: Playback support
