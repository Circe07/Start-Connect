// __mocks__/firebase-admin/firestore.js

const addMock = jest.fn(async (data) => ({ id: "mock-id", ...data }));

const docMock = jest.fn(() => ({
  get: jest.fn(async () => ({ exists: true, data: () => ({ userId: "mock-user-id" }) })),
  update: jest.fn(async () => true),
  delete: jest.fn(async () => true),
}));

const collectionMock = jest.fn(() => ({
  add: addMock,
  get: jest.fn(async () => ({
    docs: [
      {
        id: "1",
        data: () => ({
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          phone: "111-222-333",
          address: "Calle Falsa 123",
          userId: "mock-user-id",
        }),
      },
    ],
  })),
  doc: docMock,
}));

const getFirestore = jest.fn(() => ({
  collection: collectionMock,
}));

module.exports = { getFirestore };
