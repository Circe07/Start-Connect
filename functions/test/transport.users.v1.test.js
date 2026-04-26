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

  test('PATCH /api/v1/users/me responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/users',
      createUsersV1Router({
        getMyProfile: { async execute() {} },
        updateMyProfile: {
          async execute({ uid, body }) {
            expect(uid).toBe('u1');
            expect(body).toEqual({ name: 'Ana' });
            return { message: 'Perfil actualizado correctamente' };
          },
        },
      })
    );

    const response = await request(app)
      .patch('/api/v1/users/me')
      .set('x-user-uid', 'u1')
      .send({ name: 'Ana' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Perfil actualizado correctamente' });
  });

  test('GET /api/v1/users/:uid responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/users',
      createUsersV1Router({
        getMyProfile: { async execute() {} },
        getUserProfile: {
          async execute({ requesterUid, targetUid }) {
            expect(requesterUid).toBe('u1');
            expect(targetUid).toBe('u2');
            return { uid: 'u2', name: 'User2' };
          },
        },
      })
    );

    const response = await request(app).get('/api/v1/users/u2').set('x-user-uid', 'u1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ uid: 'u2', name: 'User2' });
  });
});
