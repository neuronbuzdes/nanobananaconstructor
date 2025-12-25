export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';

export interface StyleOption {
  id: string;
  name: string;
  previewUrl: string; // URL for the preview image
  promptValue?: string; // The actual text added to prompt
  group?: string; // Optional grouping for UI sections
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  options: StyleOption[];
}

export interface ReferenceImages {
  character: string | null; // Base64
  background: string | null; // Base64
  additional: string[]; // Array of Base64 strings, max 5
}

export interface GenerationSettings {
  model: ModelType;
  aspectRatio: AspectRatio;
  imageSize: ImageSize; // Only used for Pro
  referenceImages: ReferenceImages; // New structured inputs
  gender: string | null; // Gender ID (e.g., 'woman', 'man')
  selectedStyles: Record<string, string>; // categoryId -> optionId
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  settings: GenerationSettings;
  prompt: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}