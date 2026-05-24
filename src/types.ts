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

export interface ApiKeyConfig {
  provider: string;
  apiKey: string;
}
