import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storeApiKey, getApiKeys } from '../tauri-api';

const mockInvoke = vi.fn();

vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: any[]) => mockInvoke(...args),
}));

beforeEach(() => {
  mockInvoke.mockReset();
});

describe('storeApiKey', () => {
  it('should call invoke with store_api_key command', async () => {
    mockInvoke.mockResolvedValue(undefined);

    await storeApiKey('openai', 'sk-test');

    expect(mockInvoke).toHaveBeenCalledWith('store_api_key', {
      provider: 'openai',
      apiKey: 'sk-test',
    });
  });
});

describe('getApiKeys', () => {
  it('should call invoke with get_api_keys command', async () => {
    const expected = [{ provider: 'openai', api_key: 'sk-test' }];
    mockInvoke.mockResolvedValue(expected);

    const result = await getApiKeys();

    expect(mockInvoke).toHaveBeenCalledWith('get_api_keys');
    expect(result).toEqual(expected);
  });

  it('should return empty array when no keys stored', async () => {
    mockInvoke.mockResolvedValue([]);

    const result = await getApiKeys();

    expect(result).toEqual([]);
  });
});
