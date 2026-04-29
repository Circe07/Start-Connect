const express = require('express');
const request = require('supertest');

describe('http response contract', () => {
  test('returns standardized success envelope', async () => {
    const { ok } = require('../src/shared/httpResponse');
    const app = express();
    app.get('/ok', (req, res) => ok(res, { foo: 'bar' }, 200, 'req-1'));

    const response = await request(app).get('/ok');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { foo: 'bar' },
      requestId: 'req-1',
    });
  });

  test('returns standardized error envelope', async () => {
    const { fail } = require('../src/shared/httpResponse');
    const app = express();
    app.get('/fail', (req, res) =>
      fail(
        res,
        { code: 'REQUEST_ERROR', message: 'Bad input', status: 400, details: { field: 'x' } },
        'req-2'
      )
    );

    const response = await request(app).get('/fail');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      code: 'REQUEST_ERROR',
      message: 'Bad input',
      details: { field: 'x' },
      requestId: 'req-2',
    });
  });
});
