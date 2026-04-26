import {
  getSwipeCandidates,
  submitSwipe,
} from '../../src/services/discover/discoverService';
import { setAuthToken } from '../../src/services/storage/authStorage';

describe('discoverService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken('token-123');
  });

  it('loads users, groups and activities with per-source fallback', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/v1/users')) {
        return Promise.resolve({
          status: 404,
          ok: false,
          text: async () => '{}',
        } as any);
      }
      if (url.includes('/users?limit=20')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: async () =>
            JSON.stringify({
              success: true,
              data: { users: [{ id: 'u1', name: 'Alex' }] },
            }),
        } as any);
      }
      if (url.includes('/v1/groups/public')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: async () =>
            JSON.stringify({
              success: true,
              data: { groups: [{ id: 'g1', name: 'Runners', sport: 'Run' }] },
            }),
        } as any);
      }
      if (url.includes('/v1/discover/activities')) {
        return Promise.resolve({
          status: 404,
          ok: false,
          text: async () => '{}',
        } as any);
      }
      return Promise.resolve({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            data: { activities: [{ id: 'a1', title: 'Morning Ride' }] },
          }),
      } as any);
    });

    const result = await getSwipeCandidates();

    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(3);
    expect(result.data?.items.map(item => item.type)).toEqual([
      'person',
      'group',
      'activity',
    ]);
    const calledUrls = (global.fetch as jest.Mock).mock.calls.map(call => call[0]);
    expect(calledUrls.some((url: string) => url.includes('/v1/users?limit=20'))).toBe(
      true,
    );
    expect(calledUrls.some((url: string) => url.includes('/users?limit=20'))).toBe(
      true,
    );
    expect(calledUrls.some((url: string) => url.includes('/v1/groups/public'))).toBe(
      true,
    );
    expect(
      calledUrls.some((url: string) => url.includes('/v1/discover/activities')),
    ).toBe(true);
    expect(
      calledUrls.some((url: string) => url.includes('/discover/activities')),
    ).toBe(true);
  });

  it('returns partial success when one source fails and others succeed', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/users?limit=20') || url.includes('/v1/users?limit=20')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: async () =>
            JSON.stringify({ success: true, data: { users: [{ id: 'u1' }] } }),
        } as any);
      }
      if (url.includes('/groups/public')) {
        return Promise.resolve({
          status: 500,
          ok: false,
          text: async () =>
            JSON.stringify({ success: false, error: { message: 'Groups down' } }),
        } as any);
      }
      return Promise.resolve({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            data: { activities: [{ id: 'a1', title: 'Ride' }] },
          }),
      } as any);
    });

    const result = await getSwipeCandidates();
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(2);
    expect(result.warnings?.[0]).toContain('groups');
  });

  it('fails when all sources fail', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      ok: false,
      text: async () => JSON.stringify({ success: false, error: 'down' }),
    } as any);

    const result = await getSwipeCandidates();
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.warnings?.length).toBeGreaterThan(0);
  });

  it('deduplicates candidates by type-id key', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            data: { users: [{ id: 'u1', name: 'Alex' }, { id: 'u1', name: 'Alex' }] },
          }),
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { groups: [] } }),
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            data: { activities: [{ id: 'a1' }, { id: 'a1' }] },
          }),
      } as any);

    const result = await getSwipeCandidates();
    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(2);
    expect(result.data?.items.map(item => item.id)).toEqual([
      'person:u1',
      'activity:a1',
    ]);
  });

  it('sends Authorization header when auth token exists', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { users: [] } }),
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { groups: [] } }),
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { activities: [] } }),
      } as any);

    await getSwipeCandidates();
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer token-123');
    expect(options.headers['x-request-id']).toMatch(/^discover-/);
  });

  it('falls back to id parsing when raw payload has no id', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
        text: async () => '{}',
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { isMatch: false } }),
      } as any);

    await submitSwipe({
      candidate: {
        id: 'group:g7',
        type: 'group',
        title: 'Group',
      },
      direction: 'pass',
    });

    const [, options] = (global.fetch as jest.Mock).mock.calls[1];
    expect(JSON.parse(options.body).targetId).toBe('g7');
  });

  it('posts swipe direction with fallback endpoint', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
        text: async () => '{}',
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({ success: true, data: { isMatch: true } }),
      } as any);

    const result = await submitSwipe({
      candidate: {
        id: 'person:u1',
        type: 'person',
        title: 'Alex',
        raw: { id: 'u1' },
      },
      direction: 'like',
    });

    expect(result.success).toBe(true);
    const [, options] = (global.fetch as jest.Mock).mock.calls[1];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      targetType: 'person',
      targetId: 'u1',
      direction: 'like',
    });
  });
});
