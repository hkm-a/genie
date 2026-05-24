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
  /** System prompt template with optional {variable} placeholders. When set, enables real LLM generation. */
  system_prompt?: string;
  /** User prompt template with {variable} placeholders matching scene.variables[].name. */
  user_prompt_template?: string;
}

export interface PromptOptimizationMetadata {
  original_prompt: string;
  improvements: string[];
  model?: string;
}

export interface LLMResult {
  success: boolean;
  result: {
    type: 'text' | 'image';
    content?: string;
    image_url?: string;
  };
  optimized_prompt: string;
  optimization?: PromptOptimizationMetadata;
}

export interface ApiKeyConfig {
  provider: string;
  apiKey: string;
}
