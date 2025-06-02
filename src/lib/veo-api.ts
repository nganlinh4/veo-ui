import { 
  VeoConfig, 
  VeoRequest, 
  VeoOperation, 
  VeoGenerationJob,
  VEO_MODEL_ID,
  VEO_ENDPOINT 
} from '@/types/veo';

export class VeoApiClient {
  private config: VeoConfig;

  constructor(config: VeoConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    // First, try to use the provided access token
    if (this.config.accessToken) {
      return this.config.accessToken;
    }

    // Try to get token from our API endpoint (which uses gcloud CLI)
    try {
      const response = await fetch('/api/auth/token');
      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          return data.accessToken;
        }
      }
    } catch (error) {
      console.warn('Failed to get token from API:', error);
    }

    // Fallback: check environment variable (for server-side usage)
    if (typeof process !== 'undefined' && process.env?.GOOGLE_CLOUD_ACCESS_TOKEN) {
      return process.env.GOOGLE_CLOUD_ACCESS_TOKEN;
    }

    throw new Error('Access token is required. Please authenticate with Google Cloud or provide a valid access token.');
  }

  async generateVideo(request: VeoRequest): Promise<string> {
    const accessToken = await this.getAccessToken();
    
    const url = `${VEO_ENDPOINT}/projects/${this.config.projectId}/locations/us-central1/publishers/google/models/${VEO_MODEL_ID}:predictLongRunning`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate video: ${response.status} ${error}`);
    }

    const result = await response.json();
    return result.name; // Operation name
  }

  async checkOperationStatus(operationName: string): Promise<VeoOperation> {
    const accessToken = await this.getAccessToken();
    
    const url = `${VEO_ENDPOINT}/projects/${this.config.projectId}/locations/us-central1/publishers/google/models/${VEO_MODEL_ID}:fetchPredictOperation`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ operationName }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to check operation status: ${response.status} ${error}`);
    }

    return await response.json();
  }

  async pollOperationUntilComplete(
    operationName: string, 
    onProgress?: (operation: VeoOperation) => void,
    maxWaitTime = 300000 // 5 minutes
  ): Promise<VeoOperation> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const operation = await this.checkOperationStatus(operationName);
      
      if (onProgress) {
        onProgress(operation);
      }
      
      if (operation.done) {
        return operation;
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Operation timed out');
  }
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png'];
  return validTypes.includes(file.type);
}

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
