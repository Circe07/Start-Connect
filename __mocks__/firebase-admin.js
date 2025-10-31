// __mocks__/firebase-admin.js
const mockCollection = {
  add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  get: jest.fn(() => ({
    docs: [
      { id: '1', data: () => ({ firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' }) },
    ],
  })),
  doc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ userId: 'mock-user-id' }) })),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  })),
};

module.exports = {
  initializeApp: jest.fn(),
  auth: () => ({
    verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mock-user-id' })),
  }),
  firestore: () => ({
    collection: jest.fn(() => mockCollection),
  }),
  apps: [],
};
