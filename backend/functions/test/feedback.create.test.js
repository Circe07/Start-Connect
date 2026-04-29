jest.mock('../src/config/firebase', () => {
  const whereQuery = {
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true }),
  };
  const feedbackDoc = { id: 'fb-1', set: jest.fn().mockResolvedValue(undefined) };

  return {
    FieldValue: { serverTimestamp: () => 'ts' },
    db: {
      collection: jest.fn(() => ({
        where: whereQuery.where,
        limit: whereQuery.limit,
        get: whereQuery.get,
        doc: jest.fn(() => feedbackDoc),
      })),
    },
  };
});

const { createFeedback } = require('../src/controllers/feedback.controller');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('feedback create', () => {
  it('creates feedback and returns 201', async () => {
    const req = {
      user: { uid: 'u-1' },
      body: {
        experience_id: 'exp-1',
        nota_1_10: 9,
        repetiria: true,
        traeria_amigo: true,
      },
    };
    const res = mockRes();
    await createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
