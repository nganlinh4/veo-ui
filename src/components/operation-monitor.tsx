'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VeoApiClient } from '@/lib/veo-api';
import { VeoGenerationJob } from '@/types/veo';
import { Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface OperationMonitorProps {
  apiClient: VeoApiClient | null;
  jobs: VeoGenerationJob[];
  onJobUpdate: (job: VeoGenerationJob) => void;
}

export function OperationMonitor({ apiClient, jobs, onJobUpdate }: OperationMonitorProps) {
  const [pollingJobs, setPollingJobs] = useState<Set<string>>(new Set());

  const startPolling = async (job: VeoGenerationJob) => {
    if (!apiClient || pollingJobs.has(job.id)) return;

    setPollingJobs(prev => new Set(prev).add(job.id));

    try {
      await apiClient.pollOperationUntilComplete(
        job.operationName,
        (operation) => {
          const updatedJob: VeoGenerationJob = {
            ...job,
            status: operation.done ? 
              (operation.error ? 'failed' : 'completed') : 
              'running',
            ...(operation.done && operation.response && {
              videos: operation.response.predictions,
              completedAt: new Date(),
            }),
            ...(operation.error && {
              error: operation.error.message,
            }),
          };
          onJobUpdate(updatedJob);
        }
      );
    } catch (error) {
      const updatedJob: VeoGenerationJob = {
        ...job,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      onJobUpdate(updatedJob);
    } finally {
      setPollingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

  const checkStatus = async (job: VeoGenerationJob) => {
    if (!apiClient) return;

    try {
      const operation = await apiClient.checkOperationStatus(job.operationName);
      const updatedJob: VeoGenerationJob = {
        ...job,
        status: operation.done ? 
          (operation.error ? 'failed' : 'completed') : 
          'running',
        ...(operation.done && operation.response && {
          videos: operation.response.predictions,
          completedAt: new Date(),
        }),
        ...(operation.error && {
          error: operation.error.message,
        }),
      };
      onJobUpdate(updatedJob);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const getStatusIcon = (status: VeoGenerationJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: VeoGenerationJob['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'running':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  const pendingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'running');
  const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Operation Monitor
        </CardTitle>
        <CardDescription>
          Track the status of your video generation jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No video generation jobs yet
          </p>
        ) : (
          <div className="space-y-4">
            {pendingJobs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Active Jobs</h4>
                <div className="space-y-2">
                  {pendingJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{getStatusText(job.status)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {job.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started: {job.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkStatus(job)}
                          disabled={!apiClient}
                        >
                          Check Status
                        </Button>
                        {job.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => startPolling(job)}
                            disabled={!apiClient || pollingJobs.has(job.id)}
                          >
                            {pollingJobs.has(job.id) ? 'Polling...' : 'Start Polling'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedJobs.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Completed Jobs</h4>
                <div className="space-y-2">
                  {completedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{getStatusText(job.status)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {job.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.completedAt ? 
                            `Completed: ${job.completedAt.toLocaleTimeString()}` :
                            `Started: ${job.createdAt.toLocaleTimeString()}`
                          }
                        </p>
                        {job.error && (
                          <p className="text-xs text-red-500 mt-1">
                            Error: {job.error}
                          </p>
                        )}
                      </div>
                      {job.status === 'completed' && job.videos && (
                        <div className="text-sm text-green-600">
                          {job.videos.length} video(s) generated
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
