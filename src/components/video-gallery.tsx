'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VeoGenerationJob } from '@/types/veo';
import { Play, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoGalleryProps {
  jobs: VeoGenerationJob[];
}

export function VideoGallery({ jobs }: VideoGalleryProps) {
  const { t } = useLanguage();
  const completedJobs = jobs.filter(job =>
    job.status === 'completed' && job.videos && job.videos.length > 0
  );

  const downloadVideo = async (videoData: string, filename: string) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(videoData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'video/mp4' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download video:', error);
      alert(t.gallery.failedToDownload);
    }
  };

  const openInNewTab = (uri: string) => {
    window.open(uri, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {t.gallery.title}
        </CardTitle>
        <CardDescription>
          {t.gallery.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {completedJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t.gallery.noCompletedVideos}
          </p>
        ) : (
          <div className="space-y-6">
            {completedJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-medium">{job.prompt}</h4>
                  {job.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={job.imageUrl} 
                        alt="Source" 
                        className="w-24 h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.gallery.generated}: {job.completedAt?.toLocaleString()}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.gallery.duration}: {job.parameters.durationSeconds}s |
                    {t.gallery.count}: {job.parameters.sampleCount} |
                    {t.gallery.enhanced}: {job.parameters.enhancePrompt ? t.gallery.yes : t.gallery.no}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {job.videos?.map((video, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                        {video.bytesBase64Encoded ? (
                          <video
                            controls
                            className="w-full h-full rounded"
                            src={`data:${video.mimeType || 'video/mp4'};base64,${video.bytesBase64Encoded}`}
                          >
                            {t.gallery.browserNotSupported}
                          </video>
                        ) : video.uri ? (
                          <div className="text-center">
                            <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">{t.gallery.videoStoredInCloudStorage}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Play className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">{t.gallery.videoNotAvailable}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {video.bytesBase64Encoded && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadVideo(
                              video.bytesBase64Encoded!,
                              `video_${job.id}_${index + 1}.mp4`
                            )}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {t.gallery.download}
                          </Button>
                        )}
                        {video.uri && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInNewTab(video.uri!)}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t.gallery.open}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
