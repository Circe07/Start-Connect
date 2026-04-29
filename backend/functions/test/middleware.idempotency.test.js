const express = require('express');
const request = require('supertest');

describe('idempotency middleware', () => {
  test('returns cached response for repeated idempotency key', async () => {
    const { idempotencyMiddleware } = require('../src/middleware/idempotency');
    const app = express();
    app.use(express.json());
    app.use(idempotencyMiddleware());

    let calls = 0;
    app.post('/book', (req, res) => {
      calls += 1;
      return res.status(201).json({ success: true, bookingId: `b-${calls}` });
    });

    const first = await request(app)
      .post('/book')
      .set('Idempotency-Key', 'same-key')
      .send({ experience_id: 'x' });
    const second = await request(app)
      .post('/book')
      .set('Idempotency-Key', 'same-key')
      .send({ experience_id: 'x' });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.bookingId).toBe(first.body.bookingId);
    expect(calls).toBe(1);
  });
});
