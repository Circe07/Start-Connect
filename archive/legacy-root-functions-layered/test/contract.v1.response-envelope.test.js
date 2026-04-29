const express = require('express');
const request = require('supertest');
const { apiVersionV1 } = require('../src/middleware/apiVersionV1');
const { requestContext } = require('../src/middleware/requestContext');
const { createUsersV1Router } = require('../src/transport/http/usersV1Router');

describe('v1 response contract', () => {
  test('v1 responses include x-api-version and requestId', async () => {
    const app = express();
    app.use(express.json());
    app.use(requestContext);
    app.use('/api/v1', apiVersionV1);
    app.use(
      '/api/v1/users',
      createUsersV1Router({
        getMyProfile: {
          async execute() {
            return { uid: 'u1' };
          },
        },
        updateMyProfile: {
          async execute() {
            return { message: 'ok' };
          },
        },
        getUserProfile: {
          async execute() {
            return { uid: 'u2' };
          },
        },
      })
    );

    const response = await request(app).get('/api/v1/users/me').set('x-user-uid', 'u1');
    expect(response.status).toBe(200);
    expect(response.headers['x-api-version']).toBe('v1');
    expect(response.body.requestId).toBeDefined();
  });
});
