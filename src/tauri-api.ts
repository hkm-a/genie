import { invoke } from '@tauri-apps/api/core';

export interface TauriApiKeyEntry {
  provider: string;
  api_key: string;
}

export async function storeApiKey(provider: string, apiKey: string): Promise<void> {
  await invoke('store_api_key', { provider, apiKey });
}

export async function getApiKeys(): Promise<TauriApiKeyEntry[]> {
  return invoke('get_api_keys');
}
