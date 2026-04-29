const express = require('express');
const request = require('supertest');
const { createAuthV1Router } = require('../src/transport/http/authV1Router');

describe('POST /api/v1/auth/refresh', () => {
  test('responde 200 con sesion refrescada', async () => {
    const refreshSession = {
      async execute({ refreshToken }) {
        expect(refreshToken).toBe('r1');
        return { token: 't2', refreshToken: 'r2', uid: 'u1' };
      },
    };

    const app = express();
    app.use(express.json());
    app.use('/api/v1/auth', createAuthV1Router({ refreshSession }));

    const response = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'r1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: 't2',
      refreshToken: 'r2',
      uid: 'u1',
    });
  });

  test('POST /api/v1/auth/login responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/auth',
      createAuthV1Router({
        refreshSession: { async execute() {} },
        loginSession: {
          async execute({ email, password }) {
            expect(email).toBe('u@test.com');
            expect(password).toBe('Pwd12345!');
            return { token: 't1', refreshToken: 'r1', uid: 'u1' };
          },
        },
      })
    );

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'u@test.com', password: 'Pwd12345!' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      token: 't1',
      refreshToken: 'r1',
      uid: 'u1',
    });
  });

  test('GET /api/v1/auth/me responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/auth',
      createAuthV1Router({
        refreshSession: { async execute() {} },
        getMe: {
          async execute({ uid }) {
            expect(uid).toBe('u1');
            return { uid: 'u1', email: 'u@test.com', displayName: 'User One' };
          },
        },
      })
    );

    const response = await request(app).get('/api/v1/auth/me').set('x-user-uid', 'u1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      uid: 'u1',
      email: 'u@test.com',
      displayName: 'User One',
    });
  });

  test('POST /api/v1/auth/logout responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/auth',
      createAuthV1Router({
        refreshSession: { async execute() {} },
        logoutSession: {
          async execute({ uid }) {
            expect(uid).toBe('u1');
            return { message: 'Sesión cerrada correctamente' };
          },
        },
      })
    );

    const response = await request(app).post('/api/v1/auth/logout').set('x-user-uid', 'u1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  });
});
