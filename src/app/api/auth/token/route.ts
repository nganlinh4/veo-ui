import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to get access token from gcloud CLI
    try {
      const { stdout, stderr } = await execAsync('gcloud auth print-access-token', {
        timeout: 10000
      });
      
      if (stderr) {
        console.error('gcloud stderr:', stderr);
      }
      
      const accessToken = stdout.trim();
      if (accessToken && accessToken.length > 0) {
        // Validate the token format (basic check)
        if (accessToken.startsWith('ya29.') || accessToken.startsWith('1//')) {
          return NextResponse.json({ 
            accessToken,
            source: 'gcloud-cli'
          });
        }
      }
    } catch (gcloudError) {
      console.log('gcloud command failed:', gcloudError);
    }

    // Method 2: Try using service account if available
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountPath) {
      try {
        const { stdout: saToken } = await execAsync(
          `gcloud auth activate-service-account --key-file="${serviceAccountPath}" && gcloud auth print-access-token`,
          { timeout: 15000 }
        );
        
        const token = saToken.trim();
        if (token && (token.startsWith('ya29.') || token.startsWith('1//'))) {
          return NextResponse.json({ 
            accessToken: token,
            source: 'service-account'
          });
        }
      } catch (saError) {
        console.log('Service account method failed:', saError);
      }
    }

    // Method 3: Check environment variable
    const envToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN;
    if (envToken && (envToken.startsWith('ya29.') || envToken.startsWith('1//'))) {
      return NextResponse.json({ 
        accessToken: envToken,
        source: 'environment'
      });
    }

    return NextResponse.json({ 
      error: 'No valid access token available',
      suggestions: [
        'Run "gcloud auth login" to authenticate',
        'Set GOOGLE_APPLICATION_CREDENTIALS environment variable',
        'Set GOOGLE_CLOUD_ACCESS_TOKEN environment variable'
      ]
    }, { status: 401 });

  } catch (error) {
    console.error('Token retrieval error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve access token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Force refresh the token
    const { stdout } = await execAsync('gcloud auth print-access-token', {
      timeout: 10000
    });
    
    const accessToken = stdout.trim();
    if (accessToken && (accessToken.startsWith('ya29.') || accessToken.startsWith('1//'))) {
      return NextResponse.json({ 
        accessToken,
        source: 'gcloud-cli-refresh'
      });
    }

    return NextResponse.json({ 
      error: 'No valid token available'
    }, { status: 401 });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh access token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
