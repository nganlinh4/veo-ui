import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Try to get the current configured project
    const { stdout: currentProject } = await execAsync('gcloud config get-value project', {
      timeout: 5000
    });

    const projectId = currentProject.trim();
    
    if (projectId && projectId !== '(unset)') {
      return NextResponse.json({
        projectId,
        source: 'gcloud-config'
      });
    }

    // If no project is configured, try to list available projects
    try {
      const { stdout: projectsList } = await execAsync('gcloud projects list --format="value(projectId)" --limit=10', {
        timeout: 10000
      });

      const projects = projectsList.trim().split('\n').filter(p => p.length > 0);
      
      return NextResponse.json({
        projectId: null,
        availableProjects: projects,
        source: 'projects-list'
      });
    } catch (listError) {
      console.log('Could not list projects:', listError);
    }

    return NextResponse.json({
      projectId: null,
      error: 'No project configured and could not list available projects',
      suggestion: 'Run "gcloud config set project PROJECT_ID" or set project manually'
    }, { status: 404 });

  } catch (error) {
    console.error('Project ID retrieval error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve project information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({
        error: 'Project ID is required'
      }, { status: 400 });
    }

    // Set the project as default
    await execAsync(`gcloud config set project ${projectId}`, {
      timeout: 10000
    });

    // Verify the project was set
    const { stdout: verifyProject } = await execAsync('gcloud config get-value project', {
      timeout: 5000
    });

    const setProject = verifyProject.trim();
    
    if (setProject === projectId) {
      return NextResponse.json({
        projectId: setProject,
        message: 'Project set successfully',
        source: 'gcloud-config-set'
      });
    } else {
      throw new Error('Project verification failed');
    }

  } catch (error) {
    console.error('Project setting error:', error);
    return NextResponse.json({
      error: 'Failed to set project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
