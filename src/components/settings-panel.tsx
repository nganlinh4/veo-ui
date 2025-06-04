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
import { AccountSelector } from '@/components/account-selector';
import { ProjectSelector } from '@/components/project-selector';
import { ErrorDisplay } from '@/components/error-display';

interface SettingsPanelProps {
  onConfigChange: (apiClient: VeoApiClient | null) => void;
}

export function SettingsPanel({ onConfigChange }: SettingsPanelProps) {
  const { t } = useLanguage();
  const [projectId, setProjectId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-configure when account and project are both available
  useEffect(() => {
    if (activeAccount && currentProject) {
      tryAutoConfiguration();
    }
  }, [activeAccount, currentProject]);

  const handleAccountChange = (account: string | null) => {
    setActiveAccount(account);
    if (!account) {
      setCurrentProject(null);
      setIsConfigured(false);
      onConfigChange(null);
    }
  };

  const handleProjectChange = (project: string | null) => {
    setCurrentProject(project);
    setProjectId(project || '');
    if (!project) {
      setIsConfigured(false);
      onConfigChange(null);
    }
  };



  const tryAutoConfiguration = async () => {
    const project = currentProject || projectId.trim();
    if (!project) return;

    try {
      // Create API client without access token (it will auto-retrieve)
      const config: VeoConfig = {
        projectId: project,
      };

      const apiClient = new VeoApiClient(config);
      onConfigChange(apiClient);
      setIsConfigured(true);
    } catch (error) {
      console.error('Auto-configuration failed:', error);
    }
  };

  const handleSaveConfig = () => {
    const project = currentProject || projectId.trim();

    if (!project) {
      setError(t.settings.pleaseEnterValidProjectId);
      return;
    }

    // If we have an active account, use auto-configuration
    if (activeAccount) {
      setError(null);
      tryAutoConfiguration();
      return;
    }

    // Manual configuration fallback
    if (!accessToken.trim()) {
      setError(t.settings.pleaseEnterValidAccessToken);
      return;
    }

    setError(null);
    const config: VeoConfig = {
      projectId: project,
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
    setCurrentProject(null);
    onConfigChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Account Management */}
      <AccountSelector
        onAccountChange={handleAccountChange}
      />

      {/* Project Management */}
      <ProjectSelector
        onProjectChange={handleProjectChange}
        activeAccount={activeAccount}
      />

      {/* Configuration Status */}
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
          {/* Error Display */}
          {error && (
            <ErrorDisplay
              error={error}
              onDismiss={() => setError(null)}
              className="mb-4"
            />
          )}

          {/* Configuration Status */}
          {isConfigured ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">{t.settings.configurationSaved}</p>
                  <p className="text-xs">{t.settings.account}: {activeAccount}</p>
                  <p className="text-xs">{t.settings.project}: {currentProject}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">{t.settings.configurationRequired}</p>
                  <p className="text-xs">
                    {!activeAccount && !currentProject && (t.settings.selectAccountAndProject || 'Please select an account and project above')}
                    {activeAccount && !currentProject && (t.settings.selectProject || 'Please select a project above')}
                    {!activeAccount && currentProject && (t.settings.selectAccount || 'Please select an account above')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Access Token - fallback option */}
          {!activeAccount && (
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

          {/* Manual Project ID - fallback option */}
          {!currentProject && (
            <div className="space-y-2">
              <Label htmlFor="project-id">{t.settings.googleCloudProjectId}</Label>
              <Input
                id="project-id"
                placeholder={t.settings.projectIdPlaceholder}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isConfigured}
              />
            </div>
          )}

          {/* Action Buttons */}
          {isConfigured ? (
            <Button variant="outline" onClick={handleReset} className="w-full">
              {t.settings.resetConfiguration}
            </Button>
          ) : (
            <Button
              onClick={handleSaveConfig}
              disabled={!((activeAccount && currentProject) || (projectId.trim() && accessToken.trim()))}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {activeAccount ? t.settings.configureWithAutoAuth : t.settings.saveConfiguration}
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
    </div>
  );
}
