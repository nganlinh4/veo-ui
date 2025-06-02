'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VeoApiClient } from '@/lib/veo-api';
import { VeoConfig } from '@/types/veo';
import { Settings, Save, AlertCircle } from 'lucide-react';

interface SettingsPanelProps {
  onConfigChange: (apiClient: VeoApiClient | null) => void;
}

export function SettingsPanel({ onConfigChange }: SettingsPanelProps) {
  const [projectId, setProjectId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSaveConfig = () => {
    if (!projectId.trim()) {
      alert('Please enter a valid Project ID');
      return;
    }

    if (!accessToken.trim()) {
      alert('Please enter a valid Access Token');
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create a Google Cloud project and enable the Vertex AI API</li>
                <li>Set up authentication (Service Account or OAuth)</li>
                <li>Get an access token using: <code className="bg-blue-100 px-1 rounded">gcloud auth print-access-token</code></li>
                <li>Enter your project ID and access token below</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-id">Google Cloud Project ID</Label>
          <Input
            id="project-id"
            placeholder="your-project-id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isConfigured}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-token">Access Token</Label>
          <Input
            id="access-token"
            type="password"
            placeholder="ya29...."
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            disabled={isConfigured}
          />
          <p className="text-xs text-muted-foreground">
            Get your access token by running: <code>gcloud auth print-access-token</code>
          </p>
        </div>

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
            disabled={!projectId.trim() || !accessToken.trim()}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
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
