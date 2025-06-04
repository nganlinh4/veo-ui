'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, User, LogIn, LogOut, Plus, AlertCircle, ExternalLink, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Account {
  email: string;
  status: string;
  isActive: boolean;
}

interface AccountSelectorProps {
  onAccountChange?: (account: string | null) => void;
  className?: string;
}

export function AccountSelector({ onAccountChange, className }: AccountSelectorProps) {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [authInstructions, setAuthInstructions] = useState<string[]>([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setActiveAccount(data.activeAccount);
        onAccountChange?.(data.activeAccount);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load accounts');
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSwitch = async (accountEmail: string) => {
    if (accountEmail === activeAccount) return;

    try {
      setIsSwitching(true);
      setError(null);

      const response = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account: accountEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveAccount(data.account);
        onAccountChange?.(data.account);
        // Reload accounts to update status
        await loadAccounts();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to switch account');
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
      setError('Failed to switch account');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleAddAccount = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const response = await fetch('/api/auth/login', { method: 'POST' });
      const data = await response.json();

      if (response.ok && (data.action === 'auth-url-required' || data.action === 'manual-auth-required')) {
        setShowInstructions(true);
        setAuthInstructions(data.instructions || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to start authentication');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancelAuth = () => {
    setShowInstructions(false);
    setAuthInstructions([]);
    setError(null);
    setIsAuthenticating(false);
  };

  const handleLogout = async (accountEmail?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: accountEmail,
          logoutAll: !accountEmail // If no specific account, logout all
        }),
      });

      if (response.ok) {
        await loadAccounts();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to logout');
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t.settings?.accountManagement || 'Account Management'}
        </CardTitle>
        <CardDescription>
          {t.settings?.accountDescription || 'Manage your Google Cloud accounts'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.settings?.activeAccount || 'Active Account'}
          </label>
          
          {accounts.length > 0 ? (
            <Select
              value={activeAccount || ''}
              onValueChange={handleAccountSwitch}
              disabled={isSwitching || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.settings?.selectAccount || 'Select an account'} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.email} value={account.email}>
                    <div className="flex items-center gap-2">
                      <span>{account.email}</span>
                      {account.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          {t.common?.active || 'Active'}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-gray-500">
              {t.settings?.noAccountsFound || 'No authenticated accounts found'}
            </div>
          )}
        </div>

        {/* Authentication Instructions */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    {t.settings?.authenticationRequired || 'Authentication Required'}
                  </p>
                  <p className="text-xs mb-2">
                    {t.settings?.followInstructions || 'Please follow these steps to authenticate:'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCancelAuth}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="bg-white border rounded p-3">
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                  {authInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <Button
                onClick={loadAccounts}
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t.settings?.refreshToSeeAccount || 'Refresh to See New Account'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!showInstructions && (
            <Button
              onClick={handleAddAccount}
              disabled={isAuthenticating || isLoading}
              size="sm"
              variant="outline"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  {t.settings?.authenticating || 'Authenticating...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.settings?.addAccount || 'Add Account'}
                </>
              )}
            </Button>
          )}

          <Button
            onClick={loadAccounts}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {t.settings?.refresh || 'Refresh'}
          </Button>

          {activeAccount && (
            <Button
              onClick={() => handleLogout(activeAccount)}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t.settings?.logout || 'Logout'}
            </Button>
          )}

          {accounts.length > 0 && (
            <Button
              onClick={() => handleLogout()}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {t.settings?.logoutAll || 'Logout All'}
            </Button>
          )}
        </div>

        {isSwitching && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t.settings?.switchingAccount || 'Switching account...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
