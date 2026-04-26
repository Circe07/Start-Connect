const express = require('express');
const request = require('supertest');
const { createGroupsV1Router } = require('../src/transport/http/groupsV1Router');

describe('groups v1 transport', () => {
  test('GET /api/v1/groups/public responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/groups',
      createGroupsV1Router({
        getPublicGroups: {
          async execute() {
            return { groups: [{ id: 'g1' }], hasMore: false, nextStartAfterId: null };
          },
        },
      })
    );

    const response = await request(app).get('/api/v1/groups/public');
    expect(response.status).toBe(200);
    expect(response.body.groups).toHaveLength(1);
  });

  test('POST /api/v1/groups/:id/join responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/groups',
      createGroupsV1Router({
        getPublicGroups: { async execute() {} },
        joinGroup: {
          async execute({ groupId, uid }) {
            expect(groupId).toBe('g1');
            expect(uid).toBe('u1');
            return { message: 'Te has unido al grupo correctamente.' };
          },
        },
      })
    );
    const response = await request(app).post('/api/v1/groups/g1/join').set('x-user-uid', 'u1');
    expect(response.status).toBe(200);
  });

  test('POST /api/v1/groups/:id/messages responde 201', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/groups',
      createGroupsV1Router({
        getPublicGroups: { async execute() {} },
        sendGroupMessage: {
          async execute() {
            return { message: 'Mensaje enviado.', messageId: 'm1' };
          },
        },
      })
    );
    const response = await request(app)
      .post('/api/v1/groups/g1/messages')
      .set('x-user-uid', 'u1')
      .send({ content: 'hola' });
    expect(response.status).toBe(201);
    expect(response.body.messageId).toBe('m1');
  });
});
