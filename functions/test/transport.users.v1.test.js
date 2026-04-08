const express = require('express');
const request = require('supertest');
const { createUsersV1Router } = require('../src/transport/http/usersV1Router');

describe('GET /api/v1/users/me', () => {
  test('responde 200 con perfil', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/users',
      createUsersV1Router({
        getMyProfile: {
          async execute({ uid }) {
            expect(uid).toBe('u1');
            return { uid: 'u1', name: 'Ana', email: 'ana@mail.com' };
          },
        },
      })
    );

    const response = await request(app).get('/api/v1/users/me').set('x-user-uid', 'u1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      uid: 'u1',
      name: 'Ana',
      email: 'ana@mail.com',
    });
  });
});
