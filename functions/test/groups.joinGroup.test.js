const { createRes } = require("./helpers");

function createMockDb(groupsStore) {
  const groupsCollection = {
    doc: (id) => ({ __type: "docRef", collection: "groups", id }),
  };

  return {
    collection: (name) => {
      if (name !== "groups") throw new Error(`unexpected collection ${name}`);
      return groupsCollection;
    },
    runTransaction: async (fn) => {
      const t = {
        get: async (ref) => {
          const data = groupsStore.get(ref.id);
          return {
            exists: !!data,
            data: () => data,
            id: ref.id,
          };
        },
        update: (ref, patch) => {
          const prev = groupsStore.get(ref.id);
          groupsStore.set(ref.id, { ...prev, ...patch });
        },
        delete: (ref) => {
          groupsStore.delete(ref.id);
        },
      };
      return fn(t);
    },
  };
}

describe("groups.joinGroup", () => {
  test("returns 409 when group is full", async () => {
    const groupsStore = new Map();
    groupsStore.set("g1", {
      userId: "owner",
      isPublic: true,
      members: [
        { userId: "a" },
        { userId: "b" },
      ],
      memberIds: ["a", "b"],
      maxMembers: 2,
      createdAt: new Date(),
    });

    jest.resetModules();
    jest.doMock("../src/config/firebase.js", () => ({
      db: createMockDb(groupsStore),
      FieldValue: { increment: () => 0, serverTimestamp: () => "SERVER_TIME" },
    }));

    const { joinGroup } = require("../src/controllers/groups.controller");

    const req = { params: { id: "g1" }, user: { uid: "u1" } };
    const res = createRes();
    await joinGroup(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/completo/i);
  });
});

