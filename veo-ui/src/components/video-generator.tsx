'use client';

import { useState } from 'react';
import { VeoApiClient } from '@/lib/veo-api';
import { VeoGenerationJob } from '@/types/veo';
import { TextToVideo } from './text-to-video';
import { ImageToVideo } from './image-to-video';
import { OperationMonitor } from './operation-monitor';
import { VideoGallery } from './video-gallery';
import { SettingsPanel } from './settings-panel';

const TABS = [
  { id: 'text-to-video', label: 'Text to Video' },
  { id: 'image-to-video', label: 'Image to Video' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'settings', label: 'Settings' },
] as const;

type TabId = typeof TABS[number]['id'];

export function VideoGenerator() {
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const [apiClient, setApiClient] = useState<VeoApiClient | null>(null);
  const [jobs, setJobs] = useState<VeoGenerationJob[]>([]);

  const handleJobCreated = (job: VeoGenerationJob) => {
    setJobs(prev => [job, ...prev]);
    setActiveTab('monitor');
  };

  const handleJobUpdate = (updatedJob: VeoGenerationJob) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
  };

  const handleConfigChange = (client: VeoApiClient | null) => {
    setApiClient(client);
    if (client) {
      setActiveTab('text-to-video');
    }
  };

  const getTabCount = (tabId: TabId) => {
    switch (tabId) {
      case 'monitor':
        return jobs.filter(job => job.status === 'pending' || job.status === 'running').length;
      case 'gallery':
        return jobs.filter(job => job.status === 'completed' && job.videos?.length).length;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Veo Video Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate high-quality videos using Google's Veo AI model
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {TABS.map((tab) => {
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;
                const isDisabled = !apiClient && tab.id !== 'settings';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : isDisabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    disabled={isDisabled}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`
                        ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                        ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'text-to-video' && (
            <TextToVideo 
              apiClient={apiClient} 
              onJobCreated={handleJobCreated}
            />
          )}
          
          {activeTab === 'image-to-video' && (
            <ImageToVideo 
              apiClient={apiClient} 
              onJobCreated={handleJobCreated}
            />
          )}
          
          {activeTab === 'monitor' && (
            <OperationMonitor 
              apiClient={apiClient}
              jobs={jobs}
              onJobUpdate={handleJobUpdate}
            />
          )}
          
          {activeTab === 'gallery' && (
            <VideoGallery jobs={jobs} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPanel onConfigChange={handleConfigChange} />
          )}
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg border p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiClient ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {apiClient ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-gray-600">
                {jobs.length} total jobs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
