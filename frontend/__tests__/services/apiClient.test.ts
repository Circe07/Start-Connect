import { apiRequest } from '../../src/services/core/apiClient';
import { setAuthToken } from '../../src/services/storage/authStorage';

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
  });

  it('adds Authorization header when token exists', async () => {
    setAuthToken('token-123');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {},
      text: async () => JSON.stringify({ ok: true }),
    } as any);

    await apiRequest('/health');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer token-123');
  });

  it('returns parsed success payload for valid JSON response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ hello: 'world' }),
    } as any);

    const result = await apiRequest('/ping');

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ hello: 'world' });
  });

  it('returns non-json server error for non-OK text response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: {},
      text: async () => 'Internal Error',
    } as any);

    const result = await apiRequest('/broken');

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toContain('non-JSON response');
  });

  it('returns status 0 on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    const result = await apiRequest('/offline');

    expect(result.success).toBe(false);
    expect(result.status).toBe(0);
    expect(result.error).toContain('Network down');
  });
});
