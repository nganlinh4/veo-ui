import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get current active account
    const { stdout: activeAccount } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', {
      timeout: 5000
    });

    if (!activeAccount.trim()) {
      return NextResponse.json({
        error: 'No active account found. Please authenticate first.'
      }, { status: 401 });
    }

    // Get current configured project
    const { stdout: currentProject } = await execAsync('gcloud config get-value project', {
      timeout: 5000
    });

    // List all accessible projects with details
    const { stdout: projectsList } = await execAsync(
      'gcloud projects list --format="table(projectId,name,projectNumber,lifecycleState)" --sort-by=projectId',
      { timeout: 15000 }
    );

    // Parse the projects list
    const lines = projectsList.trim().split('\n');
    const projects = [];
    
    // Skip header line and parse projects
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Split by multiple spaces to handle table format
        const parts = line.split(/\s{2,}/);
        if (parts.length >= 4) {
          const projectId = parts[0];
          const name = parts[1];
          const projectNumber = parts[2];
          const lifecycleState = parts[3];
          
          projects.push({
            projectId,
            name,
            projectNumber,
            lifecycleState,
            isActive: projectId === currentProject.trim()
          });
        }
      }
    }

    // Check if Vertex AI API is enabled for each project (for first 5 projects to avoid timeout)
    const projectsWithApiStatus = await Promise.all(
      projects.slice(0, 5).map(async (project) => {
        try {
          const { stdout } = await execAsync(
            `gcloud services list --project=${project.projectId} --filter="name:aiplatform.googleapis.com" --format="value(state)"`,
            { timeout: 10000 }
          );
          
          return {
            ...project,
            vertexAiEnabled: stdout.trim() === 'ENABLED'
          };
        } catch (error) {
          return {
            ...project,
            vertexAiEnabled: false,
            apiCheckError: true
          };
        }
      })
    );

    // For remaining projects, just mark API status as unknown
    const remainingProjects = projects.slice(5).map(project => ({
      ...project,
      vertexAiEnabled: null // null means unknown
    }));

    const allProjects = [...projectsWithApiStatus, ...remainingProjects];

    return NextResponse.json({
      projects: allProjects,
      currentProject: currentProject.trim() || null,
      activeAccount: activeAccount.trim(),
      totalProjects: allProjects.length
    });

  } catch (error) {
    console.error('Projects list error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve projects list',
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
      // Check if Vertex AI API is enabled
      let vertexAiEnabled = false;
      try {
        const { stdout } = await execAsync(
          `gcloud services list --project=${projectId} --filter="name:aiplatform.googleapis.com" --format="value(state)"`,
          { timeout: 10000 }
        );
        vertexAiEnabled = stdout.trim() === 'ENABLED';
      } catch (apiError) {
        console.log('Could not check Vertex AI API status:', apiError);
      }

      return NextResponse.json({
        projectId: setProject,
        message: 'Project switched successfully',
        success: true,
        vertexAiEnabled
      });
    } else {
      throw new Error('Project verification failed');
    }

  } catch (error) {
    console.error('Project switch error:', error);
    return NextResponse.json({
      error: 'Failed to switch project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
