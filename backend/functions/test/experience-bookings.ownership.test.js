jest.mock('../src/config/firebase', () => {
  const bookingRef = {
    id: 'bk-1',
    get: jest.fn(async () => ({
      exists: true,
      data: () => ({ estado: 'confirmada', experience_id: 'exp-1', user_id: 'owner-user' }),
    })),
  };
  const experienceRef = { id: 'exp-1' };

  return {
    FieldValue: { serverTimestamp: () => 'ts' },
    db: {
      collection: jest.fn((name) => {
        if (name === 'experience_bookings') return { doc: jest.fn(() => bookingRef) };
        if (name === 'experiences') return { doc: jest.fn(() => experienceRef) };
        return { doc: jest.fn(() => ({ id: 'x' })) };
      }),
      runTransaction: jest.fn(async (cb) => {
        const trx = {
          get: jest.fn(async (ref) => {
            if (ref === bookingRef) {
              return {
                exists: true,
                data: () => ({
                  estado: 'confirmada',
                  experience_id: 'exp-1',
                  user_id: 'owner-user',
                }),
              };
            }
            if (ref === experienceRef) {
              return {
                exists: true,
                data: () => ({ plazas_totales: 10, plazas_disponibles: 0, estado: 'llena' }),
              };
            }
            return { exists: false };
          }),
          update: jest.fn(),
        };
        await cb(trx);
      }),
    },
  };
});

const { cancelExperienceBooking } = require('../src/controllers/experienceBookings.controller');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('experience booking ownership', () => {
  it('returns 403 when user cancels booking from another user', async () => {
    const req = { params: { id: 'bk-1' }, user: { uid: 'different-user', role: 'user' } };
    const res = mockRes();

    await cancelExperienceBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
