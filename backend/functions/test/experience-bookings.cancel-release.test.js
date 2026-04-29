const mockUpdate = jest.fn();

jest.mock('../src/config/firebase', () => {
  const bookingRef = {
    id: 'bk-1',
    get: jest.fn(async () => ({
      exists: true,
      data: () => ({ estado: 'confirmada', experience_id: 'exp-1', user_id: 'u-1' }),
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
                data: () => ({ estado: 'confirmada', experience_id: 'exp-1' }),
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
          update: mockUpdate,
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

describe('experience booking cancel', () => {
  it('releases a seat on cancel', async () => {
    const req = { params: { id: 'bk-1' }, user: { uid: 'u-1' } };
    const res = mockRes();

    await cancelExperienceBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ plazas_disponibles: 1, estado: 'publicada' })
    );
  });
});
