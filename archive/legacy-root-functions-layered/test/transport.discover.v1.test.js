const express = require('express');
const request = require('supertest');
const { createDiscoverV1Router } = require('../src/transport/http/discoverV1Router');

describe('discover v1 transport', () => {
  test('GET /api/v1/discover/activities responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/discover',
      createDiscoverV1Router({
        listActivities: {
          async execute() {
            return { activities: [{ id: 'a1' }] };
          },
        },
      })
    );
    const response = await request(app).get('/api/v1/discover/activities');
    expect(response.status).toBe(200);
  });

  test('POST /api/v1/discover/swipes responde 201', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/discover',
      createDiscoverV1Router({
        listActivities: {
          async execute() {
            return { activities: [] };
          },
        },
        recordSwipe: {
          async execute() {
            return { message: 'Swipe registrado.' };
          },
        },
      })
    );
    const response = await request(app)
      .post('/api/v1/discover/swipes')
      .set('x-user-uid', 'u1')
      .send({ activityId: 'a1', direction: 'like' });
    expect(response.status).toBe(201);
  });

  test('GET /api/v1/discover/matches responde 200', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      '/api/v1/discover',
      createDiscoverV1Router({
        listActivities: {
          async execute() {
            return { activities: [] };
          },
        },
        listMatches: {
          async execute() {
            return { matches: [{ id: 'a1' }] };
          },
        },
      })
    );
    const response = await request(app).get('/api/v1/discover/matches').set('x-user-uid', 'u1');
    expect(response.status).toBe(200);
  });
});
