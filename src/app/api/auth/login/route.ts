import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
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

    // Start the authentication process
    // Note: This will open a browser window for the user
    const { stdout, stderr } = await execAsync('gcloud auth login --no-launch-browser', {
      timeout: 60000 // Give user 1 minute to complete auth
    });

    if (stderr && stderr.includes('ERROR')) {
      throw new Error(stderr);
    }

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

  } catch (error) {
    console.error('Authentication error:', error);
    
    // Check if it's a timeout or user cancellation
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Authentication timed out',
          message: 'Please try again and complete the authentication process within 60 seconds',
          action: 'timeout'
        }, { status: 408 });
      }
      
      if (error.message.includes('User cancelled') || error.message.includes('cancelled')) {
        return NextResponse.json({ 
          error: 'Authentication cancelled',
          message: 'User cancelled the authentication process',
          action: 'cancelled'
        }, { status: 400 });
      }
    }

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
