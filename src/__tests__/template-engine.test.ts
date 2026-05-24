import { describe, it, expect } from 'vitest';
import { fillTemplate } from '../template-engine';

describe('fillTemplate', () => {
  it('should replace a single placeholder', () => {
    const result = fillTemplate('Hello {name}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should replace multiple placeholders', () => {
    const result = fillTemplate('{greeting}, {name}!', {
      greeting: 'Hello',
      name: 'Alice',
    });
    expect(result).toBe('Hello, Alice!');
  });

  it('should replace same placeholder appearing multiple times', () => {
    const result = fillTemplate('{x} + {x} = {y}', { x: '1', y: '2' });
    expect(result).toBe('1 + 1 = 2');
  });

  it('should leave unknown placeholders as-is', () => {
    const result = fillTemplate('Hello {name}, welcome to {city}', {
      name: 'Bob',
    });
    expect(result).toBe('Hello Bob, welcome to {city}');
  });

  it('should return empty string for empty template', () => {
    const result = fillTemplate('', { x: 'y' });
    expect(result).toBe('');
  });

  it('should return template unchanged when no placeholders', () => {
    const result = fillTemplate('Hello World', { x: 'y' });
    expect(result).toBe('Hello World');
  });

  it('should handle special characters in variable values safely', () => {
    const result = fillTemplate('Result: {value}', {
      value: '$100 & more <special>',
    });
    expect(result).toBe('Result: $100 & more <special>');
  });

  it('should handle empty variable values', () => {
    const result = fillTemplate('Hello {name}!', { name: '' });
    expect(result).toBe('Hello !');
  });
});
