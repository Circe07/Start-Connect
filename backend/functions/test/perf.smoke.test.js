const { createRes } = require('./helpers');

function makeDb(size) {
  const activities = Array.from({ length: size }, (_, i) => ({
    id: `a${i + 1}`,
    city: 'Barcelona',
    interests: ['padel'],
    createdAt: new Date(),
    location: { lat: 41.38, lng: 2.17 },
  }));
  return {
    collection(name) {
      if (name !== 'activities') throw new Error('unsupported');
      return {
        orderBy() {
          return {
            where() {
              return this;
            },
            startAfter() {
              return this;
            },
            limit(n) {
              const docs = activities.slice(0, n).map((a) => ({ id: a.id, data: () => a }));
              return {
                async get() {
                  return { size: docs.length, docs };
                },
              };
            },
          };
        },
        doc() {
          return {
            async get() {
              return { exists: false };
            },
          };
        },
      };
    },
  };
}

describe('Performance smoke', () => {
  test('listActivities handles basic burst without errors', async () => {
    jest.resetModules();
    jest.doMock('../src/config/firebase', () => ({ db: makeDb(200) }));
    const { listActivities } = require('../src/controllers/activities.controller');

    const runs = 30;
    const start = Date.now();
    const responses = await Promise.all(
      Array.from({ length: runs }).map(async () => {
        const res = createRes();
        await listActivities({ query: { city: 'Barcelona', limit: '20' } }, res);
        return res;
      })
    );
    const elapsed = Date.now() - start;

    responses.forEach((res) => expect(res.statusCode).toBe(200));
    // loose threshold for smoke test in CI/local variability
    expect(elapsed).toBeLessThan(3000);
  });

  test('messages pagination returns stable cursor fields', async () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      id: `m${i + 1}`,
      userId: 'u1',
      content: `msg-${i + 1}`,
      createdAt: new Date(),
    }));
    jest.resetModules();
    jest.doMock('../src/config/firebase.js', () => ({
      FieldValue: { serverTimestamp: () => 'SERVER_TIME', increment: () => 0 },
      db: {
        collection(name) {
          if (name !== 'groups') throw new Error('unsupported');
          return {
            doc(id) {
              return {
                id,
                async get() {
                  return {
                    exists: true,
                    data: () => ({
                      userId: 'owner1',
                      members: [{ userId: 'u1' }],
                      memberIds: ['u1'],
                      isPublic: true,
                    }),
                    id,
                  };
                },
                collection(sub) {
                  if (sub !== 'messages') throw new Error('unsupported');
                  return {
                    doc(mid) {
                      return {
                        async get() {
                          const data = messages.find((m) => m.id === mid);
                          return { exists: !!data, data: () => data, id: mid };
                        },
                      };
                    },
                    orderBy() {
                      return {
                        startAfter() {
                          return this;
                        },
                        limit(n) {
                          const docs = messages
                            .slice(0, n)
                            .map((m) => ({ id: m.id, data: () => m }));
                          return {
                            async get() {
                              return { size: docs.length, docs };
                            },
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      },
    }));
    const { getMessages } = require('../src/controllers/groups.controller');
    const res = createRes();
    await getMessages({ params: { id: 'g1' }, user: { uid: 'u1' }, query: { limit: '20' } }, res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(res.body, 'nextStartAfterId')).toBe(true);
  });
});
