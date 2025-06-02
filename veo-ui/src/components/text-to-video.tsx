'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VeoApiClient, generateJobId } from '@/lib/veo-api';
import { VeoGenerationJob, VeoParameters } from '@/types/veo';
import { Video, Loader2 } from 'lucide-react';

interface TextToVideoProps {
  apiClient: VeoApiClient | null;
  onJobCreated: (job: VeoGenerationJob) => void;
}

export function TextToVideo({ apiClient, onJobCreated }: TextToVideoProps) {
  const [prompt, setPrompt] = useState('');
  const [sampleCount, setSampleCount] = useState(1);
  const [duration, setDuration] = useState(5);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [storageUri, setStorageUri] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!apiClient || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const parameters: VeoParameters = {
        sampleCount,
        durationSeconds: duration,
        enhancePrompt,
        ...(storageUri && { storageUri }),
      };

      const request = {
        instances: [{ prompt: prompt.trim() }],
        parameters,
      };

      const operationName = await apiClient.generateVideo(request);
      
      const job: VeoGenerationJob = {
        id: generateJobId(),
        operationName,
        status: 'pending',
        prompt: prompt.trim(),
        parameters,
        createdAt: new Date(),
      };

      onJobCreated(job);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate video:', error);
      alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Text to Video
        </CardTitle>
        <CardDescription>
          Generate videos from text descriptions using Veo AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-prompt">Text Prompt</Label>
          <Textarea
            id="text-prompt"
            placeholder="Describe the video you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sample-count">Number of Videos (1-4)</Label>
            <Input
              id="sample-count"
              type="number"
              min="1"
              max="4"
              value={sampleCount}
              onChange={(e) => setSampleCount(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (5-8 seconds)</Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="8"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storage-uri">Storage URI (optional)</Label>
          <Input
            id="storage-uri"
            placeholder="gs://your-bucket/output/"
            value={storageUri}
            onChange={(e) => setStorageUri(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enhance-prompt"
            checked={enhancePrompt}
            onChange={(e) => setEnhancePrompt(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="enhance-prompt">Enhance prompt with AI</Label>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!apiClient || !prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Video'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
