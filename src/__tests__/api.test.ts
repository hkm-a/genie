import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCallLLM = vi.hoisted(() => vi.fn());
const mockOptimizePrompt = vi.hoisted(() => vi.fn());

vi.mock('../llm-service', () => ({
  callLLM: mockCallLLM,
}));

vi.mock('../prompt-optimizer', () => ({
  optimizePrompt: mockOptimizePrompt,
}));

import { getScenes, runScene } from '../api';

beforeEach(() => {
  mockCallLLM.mockReset();
  mockOptimizePrompt.mockReset();
  mockOptimizePrompt.mockImplementation(({ systemPrompt, userPrompt }) => ({
    originalPrompt: `[System]\n${systemPrompt}\n\n[User]\n${userPrompt}`,
    optimizedPrompt: `[System]\n优化:${systemPrompt}\n\n[User]\n优化:${userPrompt}\n\n[Improvements]\n- 更清晰`,
    optimizedSystemPrompt: `优化:${systemPrompt}`,
    optimizedUserPrompt: `优化:${userPrompt}`,
    improvements: ['更清晰'],
    model: 'openai',
  }));
});

const testApiKeys = [{ provider: 'openai', api_key: 'sk-test' }];

describe('getScenes', () => {
  it('should return an array of scenes', async () => {
    const scenes = await getScenes();
    expect(Array.isArray(scenes)).toBe(true);
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('each scene should have required fields', async () => {
    const scenes = await getScenes();
    for (const scene of scenes) {
      expect(scene).toHaveProperty('id');
      expect(scene).toHaveProperty('name');
      expect(scene).toHaveProperty('name_zh');
      expect(scene).toHaveProperty('type');
      expect(['text', 'image']).toContain(scene.type);
      expect(scene).toHaveProperty('category');
      expect(scene).toHaveProperty('category_zh');
      expect(scene).toHaveProperty('description');
      expect(scene).toHaveProperty('tags');
      expect(Array.isArray(scene.tags)).toBe(true);
      expect(scene).toHaveProperty('variables');
      expect(Array.isArray(scene.variables)).toBe(true);
    }
  });

  it('scenes with prompt templates should have both system_prompt and user_prompt_template', async () => {
    const scenes = await getScenes();
    const scenesWithTemplates = scenes.filter(s => s.system_prompt);
    for (const scene of scenesWithTemplates) {
      expect(scene.system_prompt).toBeTypeOf('string');
      expect(scene.user_prompt_template).toBeTypeOf('string');
    }
  });
});

describe('runScene', () => {
  it('should optimize and call LLM for a scene with prompt templates', async () => {
    mockCallLLM.mockResolvedValue('这是费曼学习法生成的回答内容');

    const result = await runScene(
      'feynman-learning',
      { topic: '量子纠缠', learner_level: '高中生' },
      testApiKeys,
    );

    expect(result.success).toBe(true);
    expect(result.result.type).toBe('text');
    expect(result.result.content).toContain('费曼学习法');
    expect(mockOptimizePrompt).toHaveBeenCalledOnce();
    expect(mockCallLLM).toHaveBeenCalledOnce();
  });

  it('should fall back to mock data for scenes without templates', async () => {
    const result = await runScene('keyword-learning', { topic: '机器学习' });
    expect(result.success).toBe(true);
    expect(result.result.type).toBe('text');
    expect(result.result.content).toBeTruthy();
    expect(mockOptimizePrompt).not.toHaveBeenCalled();
  });

  it('should return image type for image scene (mock fallback)', async () => {
    const result = await runScene('cinema-poster', { theme: '武侠', style: '水墨' });
    expect(result.success).toBe(true);
    expect(result.result.type).toBe('image');
    expect(result.result.image_url).toBeTruthy();
  });

  it('should throw for unknown scene id', async () => {
    await expect(runScene('nonexistent', {})).rejects.toThrow();
  });

  it('should throw when no API key is provided for template scene', async () => {
    await expect(
      runScene('feynman-learning', { topic: '量子纠缠', learner_level: '高中生' }, []),
    ).rejects.toThrow(/API Key/i);
  });

  it('should ignore unsupported or empty API keys for template scenes', async () => {
    await expect(
      runScene('feynman-learning', { topic: '量子纠缠', learner_level: '高中生' }, [
        { provider: 'gemini', api_key: 'gemini-key' },
        { provider: 'openai', api_key: '' },
      ]),
    ).rejects.toThrow(/OpenAI|DeepSeek|Grok/i);
    expect(mockOptimizePrompt).not.toHaveBeenCalled();
  });

  it('should pass optimized template to LLM', async () => {
    mockCallLLM.mockResolvedValue('result');

    await runScene(
      'feynman-learning',
      { topic: '量子纠缠', learner_level: '高中生' },
      testApiKeys,
    );

    const optimizerArgs = mockOptimizePrompt.mock.calls[0][0];
    expect(optimizerArgs.systemPrompt).toContain('费曼学习法');
    expect(optimizerArgs.userPrompt).toContain('量子纠缠');
    expect(optimizerArgs.userPrompt).toContain('高中生');

    const callArgs = mockCallLLM.mock.calls[0][0];
    expect(callArgs.systemPrompt).toContain('优化:');
    expect(callArgs.userPrompt).toContain('优化:');
  });

  it('should return optimization metadata', async () => {
    mockCallLLM.mockResolvedValue('result');

    const result = await runScene(
      'feynman-learning',
      { topic: '量子纠缠', learner_level: '高中生' },
      testApiKeys,
    );

    expect(result.optimized_prompt).toContain('[Improvements]');
    expect(result.optimization.improvements).toEqual(['更清晰']);
  });
});
