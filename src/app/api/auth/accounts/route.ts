import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get all authenticated accounts
    const { stdout: accountsList } = await execAsync('gcloud auth list --format="table(account,status)" --filter="status:ACTIVE OR status:INACTIVE"', {
      timeout: 10000
    });

    // Get active account
    const { stdout: activeAccount } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
      timeout: 5000
    });

    // Parse the accounts list
    const lines = accountsList.trim().split('\n');
    const accounts = [];
    
    // Skip header line and parse accounts
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Parse table format: account status
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const account = parts[0];
          const status = parts[1];
          accounts.push({
            email: account,
            status: status.toLowerCase(),
            isActive: status.toLowerCase() === 'active'
          });
        }
      }
    }

    return NextResponse.json({
      accounts,
      activeAccount: activeAccount.trim() || null,
      totalAccounts: accounts.length
    });

  } catch (error) {
    console.error('Accounts list error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve accounts list',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { account } = await request.json();
    
    if (!account || typeof account !== 'string') {
      return NextResponse.json({
        error: 'Account email is required'
      }, { status: 400 });
    }

    // Switch to the specified account
    await execAsync(`gcloud config set account ${account}`, {
      timeout: 10000
    });

    // Verify the account was set
    const { stdout: verifyAccount } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
      timeout: 5000
    });

    const activeAccount = verifyAccount.trim();
    
    if (activeAccount === account) {
      return NextResponse.json({
        account: activeAccount,
        message: 'Account switched successfully',
        success: true
      });
    } else {
      throw new Error('Account verification failed');
    }

  } catch (error) {
    console.error('Account switch error:', error);
    return NextResponse.json({
      error: 'Failed to switch account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
