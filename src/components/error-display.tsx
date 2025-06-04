'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

interface ApiError {
  code?: number;
  message?: string;
  status?: string;
}

export function ErrorDisplay({ error, onDismiss, className }: ErrorDisplayProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!error) return null;

  // Parse the error to extract useful information
  const parseError = (errorString: string) => {
    try {
      // Try to extract JSON from the error message
      const jsonMatch = errorString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const errorData = JSON.parse(jsonMatch[0]) as { error?: ApiError };
        return errorData.error;
      }
    } catch {
      // If parsing fails, return the original error
    }
    return { message: errorString };
  };

  const parsedError = parseError(error);
  const isVertexAiError = parsedError?.code === 403 && 
    parsedError?.message?.includes('Vertex AI API has not been used');
  const isPermissionError = parsedError?.code === 403;

  // Extract project ID from error message
  const projectIdMatch = error.match(/project\s+([a-zA-Z0-9-]+)/);
  const projectId = projectIdMatch?.[1];

  const getErrorTitle = () => {
    if (isVertexAiError) {
      return t.errors?.vertexAiNotEnabled || 'Vertex AI API Not Enabled';
    }
    if (isPermissionError) {
      return t.errors?.permissionDenied || 'Permission Denied';
    }
    return t.errors?.videoGenerationFailed || 'Video Generation Failed';
  };

  const getErrorDescription = () => {
    if (isVertexAiError) {
      return t.errors?.vertexAiDescription || 
        'The Vertex AI API needs to be enabled for your Google Cloud project before you can generate videos.';
    }
    if (isPermissionError) {
      return t.errors?.permissionDescription || 
        'You don\'t have permission to access this resource. Please check your project settings and permissions.';
    }
    return t.errors?.generalDescription || 
      'An error occurred while trying to generate your video. Please try again or check your configuration.';
  };

  const getActionButtons = () => {
    if (isVertexAiError && projectId) {
      const enableUrl = `https://console.developers.google.com/apis/api/aiplatform.googleapis.com/overview?project=${projectId}`;
      return (
        <div className="space-y-2">
          <Button
            onClick={() => window.open(enableUrl, '_blank')}
            size="sm"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t.errors?.enableVertexAi || 'Enable Vertex AI API'}
          </Button>
          <p className="text-xs text-gray-600">
            {t.errors?.enableInstructions || 
              'After enabling the API, wait a few minutes and try again.'}
          </p>
        </div>
      );
    }

    return (
      <Button
        onClick={() => window.location.reload()}
        size="sm"
        variant="outline"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {t.errors?.tryAgain || 'Try Again'}
      </Button>
    );
  };

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-red-800 mb-1">
                {getErrorTitle()}
              </h3>
              <p className="text-sm text-red-700">
                {getErrorDescription()}
              </p>
            </div>

            {getActionButtons()}

            {/* Technical Details (Expandable) */}
            <div className="border-t border-red-200 pt-3">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-red-700 hover:text-red-800 p-0 h-auto"
              >
                {isExpanded ? 'Hide' : 'Show'} {t.errors?.technicalDetails || 'Technical Details'}
              </Button>
              
              {isExpanded && (
                <div className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 font-mono break-all">
                  {error}
                </div>
              )}
            </div>
          </div>

          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
