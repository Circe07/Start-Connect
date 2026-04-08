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

  it('falls back from /v1/discover/activities to /discover/activities', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
        text: async () => JSON.stringify({ error: 'Ruta no encontrada' }),
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({
            success: true,
            data: {
              users: [{ id: 'u1', name: 'Alex' }],
              groups: [{ id: 'g1', name: 'Runners', sport: 'Run' }],
              activities: [{ id: 'a1', title: 'Morning Ride' }],
            },
          }),
      } as any);

    const result = await getSwipeCandidates();

    expect(result.success).toBe(true);
    expect(result.data?.items).toHaveLength(3);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
      '/v1/discover/activities',
    );
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
      '/discover/activities',
    );
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
        text: async () => JSON.stringify({ success: true, data: { isMatch: true } }),
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
