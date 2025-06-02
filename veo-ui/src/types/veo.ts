export interface VeoConfig {
  projectId: string;
  accessToken?: string;
}

export interface VeoTextPrompt {
  prompt: string;
}

export interface VeoImagePrompt {
  prompt: string;
  image: {
    bytesBase64Encoded: string;
    mimeType: 'image/jpeg' | 'image/png';
  };
}

export interface VeoParameters {
  storageUri?: string;
  sampleCount: number; // 1-4
  durationSeconds?: number; // 5-8
  enhancePrompt?: boolean;
}

export interface VeoRequest {
  instances: (VeoTextPrompt | VeoImagePrompt)[];
  parameters: VeoParameters;
}

export interface VeoOperation {
  name: string;
  done?: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: {
    predictions: VeoVideo[];
  };
}

export interface VeoVideo {
  bytesBase64Encoded?: string;
  mimeType?: string;
  uri?: string;
}

export interface VeoGenerationJob {
  id: string;
  operationName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  prompt: string;
  imageUrl?: string;
  parameters: VeoParameters;
  createdAt: Date;
  completedAt?: Date;
  videos?: VeoVideo[];
  error?: string;
}

export const VEO_MODEL_ID = 'veo-3.0-generate-preview';
export const VEO_ENDPOINT = 'https://us-central1-aiplatform.googleapis.com/v1';
