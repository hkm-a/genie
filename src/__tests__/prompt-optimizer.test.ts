import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCallLLM = vi.hoisted(() => vi.fn());

vi.mock('../llm-service', () => ({
  callLLM: mockCallLLM,
}));

import { formatPrompt, optimizePrompt } from '../prompt-optimizer';

const request = {
  systemPrompt: '你是老师',
  userPrompt: '解释量子纠缠',
  sceneType: 'text' as const,
  sceneName: '费曼学习法',
  variables: { topic: '量子纠缠' },
  provider: 'openai',
  apiKey: 'sk-test',
};

beforeEach(() => {
  mockCallLLM.mockReset();
});

describe('optimizePrompt', () => {
  it('parses optimized prompts from JSON response', async () => {
    mockCallLLM.mockResolvedValue(JSON.stringify({
      optimizedSystemPrompt: '优化后的系统提示词',
      optimizedUserPrompt: '优化后的用户提示词',
      improvements: ['更清晰', '结构更明确'],
    }));

    const result = await optimizePrompt(request);

    expect(result.optimizedSystemPrompt).toBe('优化后的系统提示词');
    expect(result.optimizedUserPrompt).toBe('优化后的用户提示词');
    expect(result.improvements).toEqual(['更清晰', '结构更明确']);
    expect(result.optimizedPrompt).toContain('[Improvements]');
    expect(mockCallLLM).toHaveBeenCalledWith(expect.objectContaining({
      temperature: 0.2,
      maxTokens: 1600,
    }));
  });

  it('parses JSON wrapped in markdown fences', async () => {
    mockCallLLM.mockResolvedValue('```json\n{"optimizedSystemPrompt":"S","optimizedUserPrompt":"U","improvements":["I"]}\n```');

    const result = await optimizePrompt(request);

    expect(result.optimizedSystemPrompt).toBe('S');
    expect(result.optimizedUserPrompt).toBe('U');
    expect(result.improvements).toEqual(['I']);
  });

  it('falls back to original prompts when JSON is invalid', async () => {
    mockCallLLM.mockResolvedValue('not json');

    const result = await optimizePrompt(request);

    expect(result.optimizedSystemPrompt).toBe(request.systemPrompt);
    expect(result.optimizedUserPrompt).toBe(request.userPrompt);
    expect(result.improvements[0]).toContain('无法解析');
  });

  it('falls back to original prompts when required fields are missing', async () => {
    mockCallLLM.mockResolvedValue(JSON.stringify({ optimizedSystemPrompt: 'S', improvements: [] }));

    const result = await optimizePrompt(request);

    expect(result.optimizedSystemPrompt).toBe(request.systemPrompt);
    expect(result.optimizedUserPrompt).toBe(request.userPrompt);
  });
});

describe('formatPrompt', () => {
  it('formats prompt sections and improvements', () => {
    const formatted = formatPrompt('S', 'U', ['I']);

    expect(formatted).toContain('[System]\nS');
    expect(formatted).toContain('[User]\nU');
    expect(formatted).toContain('- I');
  });
});
