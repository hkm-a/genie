import { contextBridge, ipcRenderer } from 'electron';

export interface Scene {
  id: string;
  name: string;
  name_zh: string;
  type: 'text' | 'image';
  category: string;
  category_zh: string;
  description: string;
  tags: string[];
  variables: Array<{
    name: string;
    label: string;
    label_zh: string;
    type: 'text' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

export interface LLMResult {
  success: boolean;
  result: {
    type: 'text' | 'image';
    content?: string;
    image_url?: string;
  };
  optimized_prompt: string;
}

const api = {
  getScenes: (): Promise<Scene[]> => ipcRenderer.invoke('get-scenes'),
  runScene: (sceneId: string, variables: any): Promise<LLMResult> => ipcRenderer.invoke('run-scene', sceneId, variables),
  saveApiKey: (provider: string, apiKey: string): Promise<void> => ipcRenderer.invoke('save-api-key', provider, apiKey),
  getApiKeys: (): Promise<any[]> => ipcRenderer.invoke('get-api-keys'),
};

export type ElectronApi = typeof api;

contextBridge.exposeInMainWorld('electron', api);
