const { createRes } = require("./helpers");

function createMockDb(groupsStore, messagesStore) {
  const groupsCollection = {
    doc: (id) => ({
      __type: "docRef",
      collection: "groups",
      id,
      get: async () => {
        const data = groupsStore.get(id);
        return { exists: !!data, data: () => data, id };
      },
      collection: (sub) => {
        if (sub !== "messages") throw new Error("unexpected subcollection");
        return {
          add: async (data) => {
            const messageId = `m${messagesStore.length + 1}`;
            messagesStore.push({ id: messageId, ...data });
            return { id: messageId };
          },
        };
      },
    }),
  };

  return {
    collection: (name) => {
      if (name !== "groups") throw new Error(`unexpected collection ${name}`);
      return groupsCollection;
    },
  };
}

describe("groups.sendMessage", () => {
  test("returns 201 when member sends message", async () => {
    const groupsStore = new Map();
    const messagesStore = [];
    groupsStore.set("g1", {
      userId: "owner",
      isPublic: true,
      members: [{ userId: "u1" }],
      memberIds: ["u1"],
      maxMembers: 10,
      createdAt: new Date(),
    });

    jest.resetModules();
    jest.doMock("../src/config/firebase.js", () => ({
      db: createMockDb(groupsStore, messagesStore),
      FieldValue: { serverTimestamp: () => "SERVER_TIME", increment: () => 0 },
    }));

    const { sendMessage } = require("../src/controllers/groups.controller");

    const req = {
      params: { id: "g1" },
      user: { uid: "u1" },
      body: { content: "hola" },
    };
    const res = createRes();
    await sendMessage(req, res);

    expect(res.statusCode).toBe(201);
    expect(messagesStore.length).toBe(1);
    expect(res.body).toHaveProperty("messageId");
  });
});

