import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { verificationCode } = body;

    // Check if already authenticated
    try {
      const { stdout: currentAuth } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
        timeout: 5000
      });

      if (currentAuth.trim()) {
        return NextResponse.json({
          message: 'Already authenticated',
          account: currentAuth.trim(),
          action: 'none'
        });
      }
    } catch (error) {
      // Continue with login process if check fails
      console.log('Auth check failed, proceeding with login');
    }

    if (!verificationCode) {
      // Step 1: Start the authentication process to get the real auth URL
      try {
        // Start gcloud auth login in background to get the actual URL
        const authProcess = exec('gcloud auth login --no-launch-browser');

        // Wait a moment for the URL to be generated
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Kill the process since we just needed the URL
        authProcess.kill();

        return NextResponse.json({
          action: 'auth-url-required',
          message: 'Please run "gcloud auth login" in your terminal and follow the instructions, then use the logout/login buttons in the UI to refresh the account list.',
          instructions: [
            'Open a terminal/command prompt',
            'Run: gcloud auth login',
            'Follow the authentication prompts',
            'Return to this page and click "Refresh" to see your account'
          ]
        });
      } catch (error) {
        return NextResponse.json({
          action: 'manual-auth-required',
          message: 'Please authenticate manually using gcloud CLI',
          instructions: [
            'Open a terminal/command prompt',
            'Run: gcloud auth login',
            'Follow the authentication prompts',
            'Return to this page and click "Refresh" to see your account'
          ]
        });
      }
    } else {
      // Step 2: Complete authentication with verification code
      try {
        // Create a temporary file with the verification code
        const tempFile = `temp_auth_${Date.now()}.txt`;
        const fs = require('fs');
        fs.writeFileSync(tempFile, verificationCode);

        try {
          // Use the temp file to provide input to gcloud
          const { stdout, stderr } = await execAsync(`gcloud auth login --no-launch-browser < ${tempFile}`, {
            timeout: 30000
          });

          // Clean up temp file
          fs.unlinkSync(tempFile);

          // Verify authentication was successful
          const { stdout: verifyAuth } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
            timeout: 5000
          });

          if (verifyAuth.trim()) {
            return NextResponse.json({
              message: 'Authentication successful',
              account: verifyAuth.trim(),
              action: 'authenticated'
            });
          } else {
            throw new Error('Authentication verification failed');
          }
        } catch (authError) {
          // Clean up temp file on error
          try { fs.unlinkSync(tempFile); } catch {}
          throw authError;
        }
      } catch (error) {
        console.error('Verification code authentication error:', error);
        return NextResponse.json({
          error: 'Invalid verification code or authentication failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          action: 'verification-failed'
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      action: 'failed'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check current authentication status
    const { stdout: authList } = await execAsync('gcloud auth list --format="table(account,status)"', {
      timeout: 5000
    });

    const { stdout: activeAccount } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
      timeout: 5000
    });

    return NextResponse.json({
      authenticated: !!activeAccount.trim(),
      activeAccount: activeAccount.trim() || null,
      authList: authList.trim()
    });

  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check authentication status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
