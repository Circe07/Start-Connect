const mockUpdate = jest.fn();

jest.mock('../src/config/firebase', () => {
  const bookingQuery = {
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true }),
  };

  const bookingDoc = { id: 'bk-1' };
  const experienceDocRef = { id: 'exp-1' };

  return {
    FieldValue: { serverTimestamp: () => 'ts' },
    db: {
      collection: jest.fn((name) => {
        if (name === 'experience_bookings') {
          return {
            where: bookingQuery.where,
            limit: bookingQuery.limit,
            get: bookingQuery.get,
            doc: jest.fn(() => bookingDoc),
          };
        }
        if (name === 'experiences') {
          return {
            doc: jest.fn(() => experienceDocRef),
          };
        }
        return { doc: jest.fn(() => ({ id: 'x' })) };
      }),
      runTransaction: jest.fn(async (cb) => {
        const trx = {
          get: jest.fn(async (ref) => {
            if (ref === experienceDocRef) {
              return {
                exists: true,
                data: () => ({ estado: 'publicada', plazas_disponibles: 2 }),
              };
            }
            return { exists: false };
          }),
          set: jest.fn(),
          update: mockUpdate,
        };
        await cb(trx);
      }),
    },
  };
});

const { createExperienceBooking } = require('../src/controllers/experienceBookings.controller');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('experience bookings capacity', () => {
  it('decrements available seats on booking', async () => {
    const req = {
      user: { uid: 'u-1' },
      body: { experience_id: 'exp-1', importe: 10 },
    };
    const res = mockRes();
    await createExperienceBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ plazas_disponibles: 1 })
    );
  });
});
