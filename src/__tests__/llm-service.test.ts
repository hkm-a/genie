import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  },
}));

import { callLLM } from '../llm-service';

beforeEach(() => {
  mockCreate.mockReset();
});

describe('callLLM', () => {
  it('should return content on successful API call', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is the response' } }],
    });

    const result = await callLLM({
      systemPrompt: 'You are helpful',
      userPrompt: 'Hello',
      apiKey: 'sk-test',
    });

    expect(result).toBe('This is the response');
  });

  it('should throw when API key is missing or empty', async () => {
    await expect(
      callLLM({
        systemPrompt: 'You are helpful',
        userPrompt: 'Hello',
        apiKey: '',
      }),
    ).rejects.toThrow(/API key/i);
  });

  it('should throw when API returns empty response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    await expect(
      callLLM({
        systemPrompt: 'You are helpful',
        userPrompt: 'Hello',
        apiKey: 'sk-test',
      }),
    ).rejects.toThrow(/空响应|empty/i);
  });

  it('should use DeepSeek config when provider is deepseek', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'deepseek response' } }],
    });

    const result = await callLLM({
      systemPrompt: 'You are helpful',
      userPrompt: 'Hi',
      apiKey: 'sk-deepseek',
      provider: 'deepseek',
    });

    expect(result).toBe('deepseek response');
  });

  it('should pass custom temperature and max tokens', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'response' } }],
    });

    await callLLM({
      systemPrompt: 'You are helpful',
      userPrompt: 'Hello',
      apiKey: 'sk-test',
      temperature: 0.2,
      maxTokens: 1600,
    });

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      temperature: 0.2,
      max_tokens: 1600,
    }));
  });

  it('should propagate API errors with status code', async () => {
    mockCreate.mockRejectedValue(new Error('401 Invalid API key'));

    await expect(
      callLLM({
        systemPrompt: 'You are helpful',
        userPrompt: 'Hello',
        apiKey: 'sk-wrong',
      }),
    ).rejects.toThrow(/401/);
  });
});
