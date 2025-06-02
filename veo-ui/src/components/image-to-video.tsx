'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VeoApiClient, generateJobId, convertImageToBase64, validateImageFile } from '@/lib/veo-api';
import { VeoGenerationJob, VeoParameters } from '@/types/veo';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface ImageToVideoProps {
  apiClient: VeoApiClient | null;
  onJobCreated: (job: VeoGenerationJob) => void;
}

export function ImageToVideo({ apiClient, onJobCreated }: ImageToVideoProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sampleCount, setSampleCount] = useState(1);
  const [duration, setDuration] = useState(5);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [storageUri, setStorageUri] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      alert('Please select a valid image file (JPEG or PNG)');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!apiClient || !selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      const parameters: VeoParameters = {
        sampleCount,
        durationSeconds: duration,
        enhancePrompt,
        ...(storageUri && { storageUri }),
      };

      const request = {
        instances: [{
          prompt: prompt.trim(),
          image: {
            bytesBase64Encoded: base64Image,
            mimeType: selectedImage.type as 'image/jpeg' | 'image/png',
          },
        }],
        parameters,
      };

      const operationName = await apiClient.generateVideo(request);
      
      const job: VeoGenerationJob = {
        id: generateJobId(),
        operationName,
        status: 'pending',
        prompt: prompt.trim(),
        imageUrl: imagePreview || undefined,
        parameters,
        createdAt: new Date(),
      };

      onJobCreated(job);
      setPrompt('');
      removeImage();
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
          <ImageIcon className="h-5 w-5" />
          Image to Video
        </CardTitle>
        <CardDescription>
          Generate videos from images with optional text descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Image</Label>
          {!selectedImage ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload an image (JPEG or PNG)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 720p or higher, 16:9 or 9:16 aspect ratio
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview || ''}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-prompt">Text Prompt (optional)</Label>
          <Textarea
            id="image-prompt"
            placeholder="Describe how the image should animate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="image-sample-count">Number of Videos (1-4)</Label>
            <Input
              id="image-sample-count"
              type="number"
              min="1"
              max="4"
              value={sampleCount}
              onChange={(e) => setSampleCount(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-duration">Duration (5-8 seconds)</Label>
            <Input
              id="image-duration"
              type="number"
              min="5"
              max="8"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-storage-uri">Storage URI (optional)</Label>
          <Input
            id="image-storage-uri"
            placeholder="gs://your-bucket/output/"
            value={storageUri}
            onChange={(e) => setStorageUri(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="image-enhance-prompt"
            checked={enhancePrompt}
            onChange={(e) => setEnhancePrompt(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="image-enhance-prompt">Enhance prompt with AI</Label>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!apiClient || !selectedImage || isGenerating}
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
