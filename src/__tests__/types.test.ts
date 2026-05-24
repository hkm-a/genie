import { describe, it, expect } from 'vitest';
import type { Scene } from '../types';

describe('Scene type', () => {
  const mockScene: Scene = {
    id: 'test',
    name: 'Test',
    name_zh: '测试',
    type: 'text',
    category: 'Test',
    category_zh: '测试',
    description: 'A test scene',
    tags: ['test'],
    variables: [
      { name: 'topic', label: 'Topic', label_zh: '主题', type: 'text', required: true },
    ],
  };

  it('should be valid without prompt templates (backward compat)', () => {
    expect(mockScene.system_prompt).toBeUndefined();
    expect(mockScene.user_prompt_template).toBeUndefined();
  });

  it('should accept system_prompt as optional string', () => {
    const scene: Scene = { ...mockScene, system_prompt: 'You are a helpful assistant.' };
    expect(scene.system_prompt).toBeTypeOf('string');
  });

  it('should accept user_prompt_template as optional string', () => {
    const scene: Scene = { ...mockScene, user_prompt_template: 'Explain {topic}' };
    expect(scene.user_prompt_template).toBeTypeOf('string');
  });

  it('should have template placeholders match variable names', () => {
    const scene: Scene = {
      ...mockScene,
      user_prompt_template: 'Explain {topic} to a {learner_level}',
      variables: [
        { name: 'topic', label: 'Topic', label_zh: '主题', type: 'text', required: true },
        { name: 'learner_level', label: 'Level', label_zh: '水平', type: 'select', required: true, options: ['A', 'B'] },
      ],
    };

    const placeholders = scene.user_prompt_template.match(/\{(\w+)\}/g) || [];
    const varNames = scene.variables.map(v => `{${v.name}}`);

    for (const ph of placeholders) {
      expect(varNames).toContain(ph);
    }
  });

  it('should work with both text and image types', () => {
    const textScene: Scene = { ...mockScene, type: 'text' };
    const imageScene: Scene = { ...mockScene, type: 'image' };
    expect(textScene.type).toBe('text');
    expect(imageScene.type).toBe('image');
  });
});
