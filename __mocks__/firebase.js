// __mocks__/firebase.js
module.exports = {
  db: {
    collection: jest.fn(() => ({
      get: jest.fn(() => ({
        docs: [
          { id: '1', data: () => ({ firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', userId: 'mock-user-id' }) },
        ],
      })),
      add: jest.fn(() => Promise.resolve({ id: 'mock-new-id' })),
      doc: jest.fn((id) => ({ // Se añade (id) para fines de depuración, aunque no es estrictamente necesario aquí
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: () => ({ userId: 'mock-user-id' }), // Asegúrar de que este userId coincida con el mock del auth middleware
          id: id // Añadir id al doc mock
        })),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mock-user-id' })),
    }),
    apps: [],
    initializeApp: jest.fn(),
  },
};
