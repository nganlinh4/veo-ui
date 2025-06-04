import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account, logoutAll } = body;

    if (logoutAll) {
      // Logout all accounts
      await execAsync('gcloud auth revoke --all', {
        timeout: 15000
      });

      return NextResponse.json({
        message: 'All accounts logged out successfully',
        success: true,
        action: 'logout-all'
      });
    } else if (account) {
      // Logout specific account
      await execAsync(`gcloud auth revoke ${account}`, {
        timeout: 10000
      });

      return NextResponse.json({
        message: `Account ${account} logged out successfully`,
        success: true,
        action: 'logout-account',
        account
      });
    } else {
      // Logout current active account
      const { stdout: activeAccount } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
        timeout: 5000
      });

      if (activeAccount.trim()) {
        await execAsync(`gcloud auth revoke ${activeAccount.trim()}`, {
          timeout: 10000
        });

        return NextResponse.json({
          message: `Account ${activeAccount.trim()} logged out successfully`,
          success: true,
          action: 'logout-active',
          account: activeAccount.trim()
        });
      } else {
        return NextResponse.json({
          error: 'No active account to logout'
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      error: 'Failed to logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
