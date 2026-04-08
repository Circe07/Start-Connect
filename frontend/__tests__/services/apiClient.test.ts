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
    expect(options.headers['x-request-id']).toMatch(/^rn-/);
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

  it('routes auth and users endpoints through v1 prefix', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      text: async () => JSON.stringify({ success: true, data: { ok: true } }),
    } as any);

    await apiRequest('/auth/login', { method: 'POST' });
    await apiRequest('/users/me', { method: 'GET' });
    await apiRequest('/posts', { method: 'GET' });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/v1/auth/login');
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('/v1/users/me');
    expect((global.fetch as jest.Mock).mock.calls[2][0]).not.toContain('/v1/posts');
  });

  it('extracts error from structured backend envelope', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => null },
      text: async () =>
        JSON.stringify({
          success: false,
          error: { code: 'AUTH_INVALID', message: 'Invalid token' },
        }),
    } as any);

    const result = await apiRequest('/auth/me', { method: 'GET' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('Invalid token');
  });

  it('retries original request after successful refresh on 401', async () => {
    setAuthToken('expired-token');
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => null },
        text: async () =>
          JSON.stringify({
            success: false,
            error: { message: 'Expired' },
          }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () =>
          JSON.stringify({
            success: true,
            data: { token: 'new-token' },
          }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () =>
          JSON.stringify({
            success: true,
            data: { user: { id: 'u1' } },
          }),
      } as any);

    const result = await apiRequest('/users/me', { method: 'GET' });

    expect(result.success).toBe(true);
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
      '/v1/auth/refresh',
    );
    const retriedOptions = (global.fetch as jest.Mock).mock.calls[2][1];
    expect(retriedOptions.headers.Authorization).toBe('Bearer new-token');
  });
});
