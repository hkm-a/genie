import OpenAI from 'openai';

export const PROVIDER_CONFIGS: Record<string, { baseURL: string; defaultModel: string }> = {
  openai: { baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  deepseek: { baseURL: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
  grok: { baseURL: 'https://api.x.ai/v1', defaultModel: 'grok-2-latest' },
};

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callLLM(request: LLMRequest): Promise<string> {
  if (!request.apiKey) {
    throw new Error('API Key 未配置，请在设置中添加');
  }

  const config = request.provider
    ? PROVIDER_CONFIGS[request.provider]
    : undefined;

  const client = new OpenAI({
    apiKey: request.apiKey,
    baseURL: config?.baseURL,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: request.model || config?.defaultModel || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 2048,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('LLM 返回了空响应');
  }
  return content;
}
