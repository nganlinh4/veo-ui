# Deployment Guide

This guide covers deploying the Veo Video Generator application to various platforms.

## Vercel Deployment (Recommended)

Vercel provides the easiest deployment option for Next.js applications.

### Prerequisites
- Vercel account
- GitHub repository with your code
- Google Cloud project with Vertex AI API enabled

### Steps

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (defaults should work)

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_ACCESS_TOKEN=your-access-token
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-app.vercel.app`

## Docker Deployment

### Dockerfile
Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run
```bash
# Build the image
docker build -t veo-ui .

# Run the container
docker run -p 3000:3000 \
  -e GOOGLE_CLOUD_PROJECT_ID=your-project-id \
  -e GOOGLE_CLOUD_ACCESS_TOKEN=your-token \
  veo-ui
```

## Google Cloud Run

Deploy directly to Google Cloud Run for seamless integration.

### Prerequisites
- Google Cloud SDK installed
- Docker installed
- Google Cloud project with necessary APIs enabled

### Steps

1. **Build and Push to Container Registry**
   ```bash
   # Configure Docker for GCR
   gcloud auth configure-docker

   # Build and tag the image
   docker build -t gcr.io/YOUR_PROJECT_ID/veo-ui .

   # Push to Container Registry
   docker push gcr.io/YOUR_PROJECT_ID/veo-ui
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy veo-ui \
     --image gcr.io/YOUR_PROJECT_ID/veo-ui \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GOOGLE_CLOUD_PROJECT_ID=YOUR_PROJECT_ID
   ```

3. **Set up Service Account (Recommended)**
   ```bash
   # Create service account
   gcloud iam service-accounts create veo-ui-service

   # Grant necessary permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:veo-ui-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   # Update Cloud Run service to use service account
   gcloud run services update veo-ui \
     --service-account=veo-ui-service@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --region=us-central1
   ```

## Environment Variables

### Required Variables
- `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_CLOUD_ACCESS_TOKEN`: Access token for API authentication

### Optional Variables
- `DEFAULT_STORAGE_URI`: Default Cloud Storage bucket for videos
- `VEO_MODEL_ID`: Veo model version (default: veo-3.0-generate-preview)
- `VEO_ENDPOINT`: API endpoint (default: https://us-central1-aiplatform.googleapis.com/v1)

## Security Considerations

### Access Tokens
- Access tokens expire regularly (typically 1 hour)
- For production, use service accounts instead of user tokens
- Consider implementing token refresh mechanisms

### Service Account Setup
```bash
# Create service account
gcloud iam service-accounts create veo-app-service \
  --display-name="Veo App Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:veo-app-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=veo-app-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### CORS Configuration
If deploying to a custom domain, ensure CORS is properly configured for your API endpoints.

## Monitoring and Logging

### Vercel
- Built-in analytics and logging
- Function logs available in dashboard
- Real-time performance monitoring

### Google Cloud Run
- Cloud Logging integration
- Cloud Monitoring for metrics
- Error reporting

### Custom Monitoring
Consider implementing:
- Application performance monitoring (APM)
- Error tracking (Sentry, Bugsnag)
- User analytics
- API usage monitoring

## Scaling Considerations

### Vercel
- Automatic scaling
- Edge functions for global performance
- CDN for static assets

### Google Cloud Run
- Automatic scaling based on traffic
- Configurable concurrency settings
- Regional deployment options

### Performance Optimization
- Implement caching for API responses
- Use CDN for video assets
- Optimize image uploads
- Consider implementing request queuing for high traffic

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Authentication Issues**
   - Verify service account permissions
   - Check environment variable configuration
   - Ensure API is enabled in Google Cloud

3. **Performance Issues**
   - Monitor function execution times
   - Check for memory limits
   - Review API rate limits

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
