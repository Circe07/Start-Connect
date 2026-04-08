const request = require('supertest');
const express = require('express');
const { requestContext } = require('../src/middleware/requestContext');
const errorHandler = require('../src/middleware/errorHandler');
const { notFoundHandler } = require('../src/middleware/notFoundHandler');

describe('security hardening middleware', () => {
  test('agrega x-request-id en respuesta', async () => {
    const app = express();
    app.use(requestContext);
    app.get('/ok', (req, res) => {
      res.status(200).json({ ok: true, requestId: req.requestId });
    });

    const response = await request(app).get('/ok');
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });

  test('error handler incluye requestId y code', async () => {
    const app = express();
    app.use(requestContext);
    app.get('/boom', () => {
      throw new Error('boom');
    });
    app.use(errorHandler);

    const response = await request(app).get('/boom');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('INTERNAL_ERROR');
    expect(response.body.requestId).toBeDefined();
  });

  test('notFound handler responde 404 consistente', async () => {
    const app = express();
    app.use(requestContext);
    app.use(notFoundHandler);
    const response = await request(app).get('/missing');
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.requestId).toBeDefined();
  });
});
