'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, FolderOpen, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
  isActive: boolean;
  vertexAiEnabled?: boolean | null;
  apiCheckError?: boolean;
}

interface ProjectSelectorProps {
  onProjectChange?: (projectId: string | null) => void;
  activeAccount?: string | null;
  className?: string;
}

export function ProjectSelector({ onProjectChange, activeAccount, className }: ProjectSelectorProps) {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeAccount) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [activeAccount]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/projects/list');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setCurrentProject(data.currentProject);
        onProjectChange?.(data.currentProject);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSwitch = async (projectId: string) => {
    if (projectId === currentProject) return;

    try {
      setIsSwitching(true);
      setError(null);

      const response = await fetch('/api/projects/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentProject(data.projectId);
        onProjectChange?.(data.projectId);
        // Reload projects to update status
        await loadProjects();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to switch project');
      }
    } catch (error) {
      console.error('Failed to switch project:', error);
      setError('Failed to switch project');
    } finally {
      setIsSwitching(false);
    }
  };

  const getVertexAiStatusIcon = (project: Project) => {
    if (project.vertexAiEnabled === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (project.vertexAiEnabled === false) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else {
      return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVertexAiStatusText = (project: Project) => {
    if (project.vertexAiEnabled === true) {
      return t.settings?.vertexAiEnabled || 'Vertex AI Enabled';
    } else if (project.vertexAiEnabled === false) {
      return t.settings?.vertexAiDisabled || 'Vertex AI Disabled';
    } else {
      return t.settings?.vertexAiUnknown || 'Status Unknown';
    }
  };

  if (!activeAccount) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {t.settings?.projectManagement || 'Project Management'}
          </CardTitle>
          <CardDescription>
            {t.settings?.projectDescription || 'Manage your Google Cloud projects'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center py-4">
            {t.settings?.selectAccountFirst || 'Please select an account first'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          {t.settings?.projectManagement || 'Project Management'}
        </CardTitle>
        <CardDescription>
          {t.settings?.projectDescription || 'Manage your Google Cloud projects'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.settings?.activeProject || 'Active Project'}
          </label>
          
          {projects.length > 0 ? (
            <Select
              value={currentProject || ''}
              onValueChange={handleProjectSwitch}
              disabled={isSwitching || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.settings?.selectProject || 'Select a project'} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.projectId} value={project.projectId}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1">
                        <div className="font-medium">{project.projectId}</div>
                        <div className="text-xs text-gray-500">{project.name}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getVertexAiStatusIcon(project)}
                        {project.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            {t.common?.active || 'Active'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-gray-500">
              {isLoading 
                ? (t.settings?.loadingProjects || 'Loading projects...')
                : (t.settings?.noProjectsFound || 'No projects found')
              }
            </div>
          )}
        </div>

        {currentProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium mb-1">
                {t.settings?.currentProject || 'Current Project'}: {currentProject}
              </div>
              {projects.find(p => p.projectId === currentProject) && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getVertexAiStatusIcon(projects.find(p => p.projectId === currentProject)!)}
                  <span>{getVertexAiStatusText(projects.find(p => p.projectId === currentProject)!)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={loadProjects}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {t.settings?.refresh || 'Refresh'}
          </Button>
        </div>

        {isSwitching && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t.settings?.switchingProject || 'Switching project...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
