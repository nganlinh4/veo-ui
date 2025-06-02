'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VeoApiClient } from '@/lib/veo-api';
import { VeoConfig } from '@/types/veo';
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw, LogIn } from 'lucide-react';

interface SettingsPanelProps {
  onConfigChange: (apiClient: VeoApiClient | null) => void;
}

export function SettingsPanel({ onConfigChange }: SettingsPanelProps) {
  const [projectId, setProjectId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'not-authenticated' | 'error'>('checking');
  const [authenticatedAccount, setAuthenticatedAccount] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [autoAuthAvailable, setAutoAuthAvailable] = useState(false);

  // Check authentication status and project ID on component mount
  useEffect(() => {
    checkAuthStatus();
    checkProjectId();
  }, []);

  const checkProjectId = async () => {
    try {
      const response = await fetch('/api/auth/project');
      if (response.ok) {
        const data = await response.json();
        if (data.projectId) {
          setProjectId(data.projectId);
        }
      }
    } catch (error) {
      console.error('Project ID check failed:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setAuthStatus('checking');
      const response = await fetch('/api/auth/login');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.activeAccount) {
          setAuthStatus('authenticated');
          setAuthenticatedAccount(data.activeAccount);
          setAutoAuthAvailable(true);

          // Try to auto-configure if we have a project ID
          if (projectId) {
            await tryAutoConfiguration();
          }
        } else {
          setAuthStatus('not-authenticated');
          setAutoAuthAvailable(true);
        }
      } else {
        setAuthStatus('not-authenticated');
        setAutoAuthAvailable(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthStatus('error');
      setAutoAuthAvailable(false);
    }
  };

  const handleGoogleCloudLogin = async () => {
    try {
      setIsAuthenticating(true);
      const response = await fetch('/api/auth/login', { method: 'POST' });
      const data = await response.json();

      if (response.ok && data.action === 'authenticated') {
        setAuthStatus('authenticated');
        setAuthenticatedAccount(data.account);
        alert(`Successfully authenticated as: ${data.account}`);

        // Try to auto-configure if we have a project ID
        if (projectId) {
          await tryAutoConfiguration();
        }
      } else if (data.action === 'none') {
        setAuthStatus('authenticated');
        setAuthenticatedAccount(data.account);
        alert(`Already authenticated as: ${data.account}`);
      } else {
        alert(`Authentication failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const tryAutoConfiguration = async () => {
    if (!projectId.trim()) return;

    try {
      // Create API client without access token (it will auto-retrieve)
      const config: VeoConfig = {
        projectId: projectId.trim(),
      };

      const apiClient = new VeoApiClient(config);
      onConfigChange(apiClient);
      setIsConfigured(true);
    } catch (error) {
      console.error('Auto-configuration failed:', error);
    }
  };

  const handleSaveConfig = () => {
    if (!projectId.trim()) {
      alert('Please enter a valid Project ID');
      return;
    }

    // If authenticated automatically, don't require manual token
    if (authStatus === 'authenticated') {
      tryAutoConfiguration();
      return;
    }

    // Manual configuration fallback
    if (!accessToken.trim()) {
      alert('Please enter a valid Access Token or use automatic authentication');
      return;
    }

    const config: VeoConfig = {
      projectId: projectId.trim(),
      accessToken: accessToken.trim(),
    };

    const apiClient = new VeoApiClient(config);
    onConfigChange(apiClient);
    setIsConfigured(true);
  };

  const handleReset = () => {
    setProjectId('');
    setAccessToken('');
    setIsConfigured(false);
    onConfigChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuration
        </CardTitle>
        <CardDescription>
          Configure your Google Cloud project and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className={`border rounded-lg p-4 ${
          authStatus === 'authenticated' ? 'bg-green-50 border-green-200' :
          authStatus === 'not-authenticated' ? 'bg-yellow-50 border-yellow-200' :
          authStatus === 'error' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start gap-2">
            {authStatus === 'checking' && <RefreshCw className="h-5 w-5 text-gray-600 mt-0.5 animate-spin" />}
            {authStatus === 'authenticated' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
            {authStatus === 'not-authenticated' && <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />}
            {authStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}

            <div className="text-sm flex-1">
              {authStatus === 'checking' && (
                <p className="text-gray-800">Checking Google Cloud authentication...</p>
              )}
              {authStatus === 'authenticated' && (
                <div>
                  <p className="font-medium text-green-800 mb-1">✅ Authenticated with Google Cloud</p>
                  <p className="text-green-700 text-xs">Account: {authenticatedAccount}</p>
                  <p className="text-green-700 text-xs">Automatic token retrieval is available</p>
                </div>
              )}
              {authStatus === 'not-authenticated' && autoAuthAvailable && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">Google Cloud authentication required</p>
                  <p className="text-yellow-700 text-xs">Click "Authenticate with Google Cloud" below to sign in automatically</p>
                </div>
              )}
              {authStatus === 'not-authenticated' && !autoAuthAvailable && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">Manual authentication required</p>
                  <p className="text-yellow-700 text-xs">Automatic authentication not available. Please enter credentials manually.</p>
                </div>
              )}
              {authStatus === 'error' && (
                <div>
                  <p className="font-medium text-red-800 mb-1">Authentication check failed</p>
                  <p className="text-red-700 text-xs">Please check if Google Cloud SDK is installed and try manual authentication</p>
                </div>
              )}
            </div>

            {authStatus === 'not-authenticated' && autoAuthAvailable && (
              <Button
                onClick={handleGoogleCloudLogin}
                disabled={isAuthenticating}
                size="sm"
                className="ml-2"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1" />
                    Authenticate
                  </>
                )}
              </Button>
            )}

            {authStatus === 'authenticated' && (
              <Button
                onClick={checkAuthStatus}
                size="sm"
                variant="outline"
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create a Google Cloud project and enable the Vertex AI API</li>
                <li>Run the setup script (setup-and-run.bat) for automatic installation and authentication</li>
                <li>Or manually: Install Google Cloud SDK and run <code className="bg-blue-100 px-1 rounded">gcloud auth login</code></li>
                <li>Enter your project ID below</li>
                {authStatus !== 'authenticated' && (
                  <li>If automatic authentication fails, get a token manually: <code className="bg-blue-100 px-1 rounded">gcloud auth print-access-token</code></li>
                )}
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-id">Google Cloud Project ID</Label>
          <div className="flex gap-2">
            <Input
              id="project-id"
              placeholder="your-project-id"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isConfigured}
              className="flex-1"
            />
            {!isConfigured && authStatus === 'authenticated' && (
              <Button
                onClick={checkProjectId}
                size="sm"
                variant="outline"
                className="px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {projectId && (
            <p className="text-xs text-green-600">
              ✅ Project ID detected automatically
            </p>
          )}
        </div>

        {/* Access Token - only show if not automatically authenticated */}
        {authStatus !== 'authenticated' && (
          <div className="space-y-2">
            <Label htmlFor="access-token">Access Token (Manual)</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="ya29...."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">
              Only required if automatic authentication is not available. Get your access token by running: <code>gcloud auth print-access-token</code>
            </p>
          </div>
        )}

        {isConfigured ? (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                ✓ Configuration saved successfully
              </p>
              <p className="text-xs text-green-700 mt-1">
                Project: {projectId}
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset Configuration
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSaveConfig}
            disabled={!projectId.trim() || (authStatus !== 'authenticated' && !accessToken.trim())}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {authStatus === 'authenticated' ? 'Configure with Auto-Auth' : 'Save Configuration'}
          </Button>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Additional Resources</h4>
          <div className="space-y-2 text-sm">
            <a 
              href="https://cloud.google.com/vertex-ai/docs/generative-ai/video/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              → Veo API Documentation
            </a>
            <a 
              href="https://cloud.google.com/docs/authentication/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              → Authentication Guide
            </a>
            <a 
              href="https://console.cloud.google.com/apis/library/aiplatform.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              → Enable Vertex AI API
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
