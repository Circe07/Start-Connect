const { createRes } = require('./helpers');

function createMvpDb() {
  const activities = new Map();
  const userSwipes = new Map();
  const groups = new Map();
  const groupMessages = new Map();

  const db = {
    collection(name) {
      if (name === 'activities') {
        return {
          doc: (id) => ({
            async get() {
              const data = activities.get(id);
              return { exists: !!data, data: () => data, id };
            },
            async set(data) {
              activities.set(id, data);
            },
          }),
          orderBy() {
            const docs = [...activities.entries()].map(([id, data]) => ({ id, data: () => data }));
            return {
              where() {
                return this;
              },
              startAfter() {
                return this;
              },
              limit() {
                return {
                  async get() {
                    return { size: docs.length, docs };
                  },
                };
              },
            };
          },
        };
      }
      if (name === 'users') {
        return {
          doc: (uid) => ({
            collection: (sub) => {
              if (sub !== 'swipes') throw new Error('unsupported subcollection');
              if (!userSwipes.has(uid)) userSwipes.set(uid, new Map());
              const store = userSwipes.get(uid);
              return {
                doc: (activityId) => ({
                  async get() {
                    const data = store.get(activityId);
                    return { exists: !!data, data: () => data };
                  },
                  async set(data, opts) {
                    const prev = store.get(activityId) || {};
                    store.set(activityId, opts?.merge ? { ...prev, ...data } : data);
                  },
                  id: activityId,
                }),
                where() {
                  const docs = [...store.entries()]
                    .filter(([, d]) => d.direction === 'like')
                    .map(([id, data]) => ({ id, data: () => data }));
                  return {
                    orderBy() {
                      return this;
                    },
                    startAfter() {
                      return this;
                    },
                    limit(n) {
                      return {
                        async get() {
                          return { size: Math.min(docs.length, n), docs: docs.slice(0, n) };
                        },
                      };
                    },
                  };
                },
              };
            },
          }),
        };
      }
      if (name === 'groups') {
        return {
          doc: (id) => ({
            id,
            async get() {
              const data = groups.get(id);
              return { exists: !!data, data: () => data, id };
            },
            collection: (sub) => {
              if (sub !== 'messages') throw new Error('unsupported group subcollection');
              if (!groupMessages.has(id)) groupMessages.set(id, []);
              const msgs = groupMessages.get(id);
              return {
                async add(data) {
                  const msgId = `m${msgs.length + 1}`;
                  msgs.push({ id: msgId, ...data });
                  return { id: msgId };
                },
                orderBy() {
                  return {
                    limit(n) {
                      const docs = msgs.slice(0, n).map((m) => ({ id: m.id, data: () => m }));
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
          }),
        };
      }
      throw new Error(`unsupported collection: ${name}`);
    },
    async runTransaction(fn) {
      const t = {
        async get(ref) {
          return ref.get();
        },
        update(ref, patch) {
          const prev = groups.get(ref.id);
          groups.set(ref.id, { ...prev, ...patch });
        },
      };
      return fn(t);
    },
    __seed: { activities, groups },
  };

  return db;
}

describe('MVP E2E controller flows', () => {
  let db;
  let authCtrl;
  let activitiesCtrl;
  let swipesCtrl;
  let matchesCtrl;
  let groupsCtrl;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    db = createMvpDb();
    db.__seed.activities.set('a1', {
      city: 'Barcelona',
      interests: ['padel'],
      createdAt: new Date(),
      location: { lat: 41.38, lng: 2.17 },
    });
    db.__seed.groups.set('g1', {
      userId: 'owner1',
      members: [{ userId: 'u1', role: 'admin', joinedAt: new Date() }],
      memberIds: ['u1'],
      maxMembers: 3,
      isPublic: true,
      createdAt: new Date(),
    });

    jest.doMock('../src/config/firebase', () => ({
      db,
      FieldValue: { serverTimestamp: () => 'SERVER_TIME', increment: () => 0 },
      admin: {
        firestore: { FieldValue: { serverTimestamp: () => 'SERVER_TIME' } },
        auth: () => ({
          createUser: async () => ({ uid: 'uReg', email: 'u@test.com' }),
          revokeRefreshTokens: async () => {},
          getUser: async () => ({ uid: 'u1', email: 'u1@test.com', displayName: 'User1' }),
        }),
      },
    }));

    // Define node-fetch mock after resetModules so controller and test share
    // the exact same mock instance.
    jest.doMock('node-fetch', () => {
      const fn = jest.fn();
      fn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ idToken: 't1', refreshToken: 'r1', localId: 'u1' }),
      });
      fn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id_token: 't2', refresh_token: 'r2', user_id: 'u1' }),
      });
      return fn;
    });

    authCtrl = require('../src/controllers/auth.controller');
    activitiesCtrl = require('../src/controllers/activities.controller');
    swipesCtrl = require('../src/controllers/swipes.controller');
    matchesCtrl = require('../src/controllers/matches.controller');
    groupsCtrl = require('../src/controllers/groups.controller');
  });

  test('Auth flow: login -> refresh -> me -> logout', async () => {
    process.env.AUTH_API_KEY = 'k';
    const loginRes = createRes();
    await authCtrl.login({ body: { email: 'u@test.com', password: '12345678!' } }, loginRes);
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBe('t1');

    const refreshRes = createRes();
    await authCtrl.refresh({ body: { refreshToken: 'r1' } }, refreshRes);
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.token).toBe('t2');

    const meRes = createRes();
    await authCtrl.me({ user: { uid: 'u1' } }, meRes);
    expect(meRes.statusCode).toBe(200);

    const logoutRes = createRes();
    await authCtrl.logut({ user: { uid: 'u1' } }, logoutRes);
    expect(logoutRes.statusCode).toBe(200);
  });

  test('Discover flow: activities -> swipe like -> matches', async () => {
    const actRes = createRes();
    await activitiesCtrl.listActivities({ query: { city: 'Barcelona', limit: '10' } }, actRes);
    expect(actRes.statusCode).toBe(200);
    expect(actRes.body.activities.length).toBeGreaterThan(0);

    const swipeRes = createRes();
    await swipesCtrl.recordSwipe(
      { user: { uid: 'u1' }, body: { activityId: 'a1', direction: 'like' } },
      swipeRes
    );
    expect(swipeRes.statusCode).toBe(201);

    const matchesRes = createRes();
    await matchesCtrl.listMatches({ user: { uid: 'u1' }, query: { limit: '10' } }, matchesRes);
    expect(matchesRes.statusCode).toBe(200);
    expect(matchesRes.body.matches.length).toBeGreaterThan(0);
  });

  test('Groups/chat flow: join -> send message -> list messages', async () => {
    const joinRes = createRes();
    await groupsCtrl.joinGroup({ params: { id: 'g1' }, user: { uid: 'u2' } }, joinRes);
    expect(joinRes.statusCode).toBe(200);

    const sendRes = createRes();
    await groupsCtrl.sendMessage(
      {
        params: { id: 'g1' },
        user: { uid: 'u2' },
        body: { content: 'hola equipo' },
      },
      sendRes
    );
    expect(sendRes.statusCode).toBe(201);

    const listRes = createRes();
    await groupsCtrl.getMessages(
      { params: { id: 'g1' }, user: { uid: 'u2' }, query: { limit: '10' } },
      listRes
    );
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.messages.length).toBeGreaterThan(0);
  });
});
