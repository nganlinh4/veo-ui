'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VeoApiClient } from '@/lib/veo-api';
import { VeoConfig } from '@/types/veo';
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsPanelProps {
  onConfigChange: (apiClient: VeoApiClient | null) => void;
}

export function SettingsPanel({ onConfigChange }: SettingsPanelProps) {
  const { t } = useLanguage();
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
        alert(`${t.settings.successfullyAuthenticated}: ${data.account}`);

        // Try to auto-configure if we have a project ID
        if (projectId) {
          await tryAutoConfiguration();
        }
      } else if (data.action === 'none') {
        setAuthStatus('authenticated');
        setAuthenticatedAccount(data.account);
        alert(`${t.settings.alreadyAuthenticated}: ${data.account}`);
      } else {
        alert(`${t.settings.authenticationFailed}: ${data.error || t.common.unknownError}`);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      alert(t.settings.authenticationFailedTryAgain);
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
      alert(t.settings.pleaseEnterValidProjectId);
      return;
    }

    // If authenticated automatically, don't require manual token
    if (authStatus === 'authenticated') {
      tryAutoConfiguration();
      return;
    }

    // Manual configuration fallback
    if (!accessToken.trim()) {
      alert(t.settings.pleaseEnterValidAccessToken);
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
          {t.settings.title}
        </CardTitle>
        <CardDescription>
          {t.settings.description}
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
                <p className="text-gray-800">{t.settings.checkingAuth}</p>
              )}
              {authStatus === 'authenticated' && (
                <div>
                  <p className="font-medium text-green-800 mb-1">{t.settings.authenticatedWithGoogleCloud}</p>
                  <p className="text-green-700 text-xs">{t.settings.account}: {authenticatedAccount}</p>
                  <p className="text-green-700 text-xs">{t.settings.automaticTokenRetrieval}</p>
                </div>
              )}
              {authStatus === 'not-authenticated' && autoAuthAvailable && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">{t.settings.googleCloudAuthRequired}</p>
                  <p className="text-yellow-700 text-xs">{t.settings.clickToSignIn}</p>
                </div>
              )}
              {authStatus === 'not-authenticated' && !autoAuthAvailable && (
                <div>
                  <p className="font-medium text-yellow-800 mb-1">{t.settings.manualAuthRequired}</p>
                  <p className="text-yellow-700 text-xs">{t.settings.automaticAuthNotAvailable}</p>
                </div>
              )}
              {authStatus === 'error' && (
                <div>
                  <p className="font-medium text-red-800 mb-1">{t.settings.authCheckFailed}</p>
                  <p className="text-red-700 text-xs">{t.settings.checkIfGoogleCloudSDK}</p>
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
                    {t.settings.authenticating}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1" />
                    {t.settings.authenticate}
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
                {t.settings.refresh}
              </Button>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t.settings.setupInstructions}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>{t.settings.createGoogleCloudProject}</li>
                <li>{t.settings.runSetupScript}</li>
                <li>{t.settings.manuallyInstallSDK} <code className="bg-blue-100 px-1 rounded">gcloud auth login</code></li>
                <li>{t.settings.enterProjectId}</li>
                {authStatus !== 'authenticated' && (
                  <li>{t.settings.getTokenManually} <code className="bg-blue-100 px-1 rounded">gcloud auth print-access-token</code></li>
                )}
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-id">{t.settings.googleCloudProjectId}</Label>
          <div className="flex gap-2">
            <Input
              id="project-id"
              placeholder={t.settings.projectIdPlaceholder}
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
              {t.settings.projectIdDetected}
            </p>
          )}
        </div>

        {/* Access Token - only show if not automatically authenticated */}
        {authStatus !== 'authenticated' && (
          <div className="space-y-2">
            <Label htmlFor="access-token">{t.settings.accessTokenManual}</Label>
            <Input
              id="access-token"
              type="password"
              placeholder={t.settings.accessTokenPlaceholder}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">
              {t.settings.onlyRequiredIfAutoAuth} <code>gcloud auth print-access-token</code>
            </p>
          </div>
        )}

        {isConfigured ? (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                {t.settings.configurationSaved}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {t.settings.project}: {projectId}
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full">
              {t.settings.resetConfiguration}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSaveConfig}
            disabled={!projectId.trim() || (authStatus !== 'authenticated' && !accessToken.trim())}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {authStatus === 'authenticated' ? t.settings.configureWithAutoAuth : t.settings.saveConfiguration}
          </Button>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">{t.settings.additionalResources}</h4>
          <div className="space-y-2 text-sm">
            <a
              href="https://cloud.google.com/vertex-ai/docs/generative-ai/video/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              {t.settings.veoApiDocumentation}
            </a>
            <a
              href="https://cloud.google.com/docs/authentication/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              {t.settings.authenticationGuide}
            </a>
            <a
              href="https://console.cloud.google.com/apis/library/aiplatform.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              {t.settings.enableVertexAI}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
