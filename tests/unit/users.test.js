const request = require('supertest');

// --- 1. Mocks de Funciones Finales ---
// (Estos se asignan a las operaciones finales: get, add, update, delete)
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockGetCollection = jest.fn();
const mockGetDoc = jest.fn();

// --- 2. Mocks de Estructura de Firestore (CORREGIDA) ---
// Esta es la estructura que TU CÓDIGO (users.js) espera.

// .../contacts/{contactId}
const mockContactDocRef = {
  get: mockGetDoc,
  update: mockUpdate,
  delete: mockDelete,
};

// .../contacts (Colección final)
const mockContactsCollectionRef = {
  get: mockGetCollection,
  add: mockAdd,
  doc: jest.fn(() => mockContactDocRef), // Devuelve la referencia al documento de contacto
};

// .../User/{userId} (Documento de usuario)
const mockUserDocRef = {
  get: jest.fn(async () => ({
    exists: true,
    data: () => ({ userId: 'mock-user-id' }),
  })),
  collection: jest.fn((collectionName) => {
    if (collectionName === 'contacts') {
      return mockContactsCollectionRef;
    }
  }),
};

// --- 3. Mock Principal de 'firebase' (CORREGIDO) ---
// Simula el objeto 'db'
const mockDb = {
  collection: jest.fn((collectionName) => {
    // Cuando se llama a .collection('User')...
    if (collectionName === 'User') {
      // ...devuelve un objeto que tiene la función .doc()
      return {
        doc: jest.fn(() => mockUserDocRef), // .doc(userId) devuelve la referencia al documento de usuario
      };
    }
  }),
};

// Mockeo de firebase.js
jest.mock('../../functions/src/config/firebase`', () => ({
  db: mockDb, // Usa el mockDb corregido
  admin: {
    app: () => ({
      options: {
        credential: {
          projectId: 'mock-project-id'
        }
      }
    }),
    auth: () => ({
      verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mock-user-id' })),
    }),
  },
}));


// --- 4. Mock de Autenticación (Se mantiene) ---
jest.mock('../../src/middleware/auth.js', () => {
  return function (req, res, next) {
    req.user = { uid: 'mock-user-id' };
    next();
  };
});

// --- 5. Importación de la App (DEBE ir DESPUÉS de los mocks) ---
const app = require('../../src/app');

// --- 6. Datos de Prueba ---
const MOCK_CONTACT_ID = 'mock-contact-id';
const MOCK_CONTACT_DATA = {
  firstname: 'TestName',
  lastname: 'TestLastname',
  email: 'test@example.com',
  phone: '123-456-7890',
  userId: 'mock-user-id',
};

// --- 7. Limpieza antes de cada Test ---
beforeEach(() => {
  jest.clearAllMocks();

  // --- Configuración de Mocks por Defecto ---

  // GET /users (get de colección)
  mockGetCollection.mockResolvedValue({
    docs: [
      {
        id: MOCK_CONTACT_ID,
        data: () => (MOCK_CONTACT_DATA),
      },
    ],
  });

  // GET /update, /delete (get de documento)
  mockGetDoc.mockResolvedValue({
    exists: true,
    data: () => ({ userId: 'mock-user-id' }), // El propietario por defecto es el mock-user-id
  });

  // POST /new-contact
  mockAdd.mockResolvedValue({ id: 'new-mock-id' });
  // PATCH /update-contact
  mockUpdate.mockResolvedValue();
  // DELETE /delete-contact
  mockDelete.mockResolvedValue();
});


// --- 8. Suite de Pruebas ---
describe('Pruebas para /api/users (Rutas de Contactos)', () => {

  // 1. GET /users
  test('1. GET /users debería retornar todos los contactos y status 200', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('firstname', 'TestName');
  });

  // 2. POST /new-contact
  test('2. POST /new-contact debería crear un nuevo contacto y retornar 201', async () => {
    const newContact = {
      firstname: 'New',
      lastname: 'User',
      email: 'new@user.com',
      phone: '555-1212',
    };
    const response = await request(app)
      .post('/api/users/new-contact')
      .send(newContact);

    expect(response.statusCode).toBe(201);
    expect(mockAdd).toHaveBeenCalled();
    expect(response.body).toHaveProperty('contactId', 'new-mock-id');

  });

  // 3. PATCH /update-contact/:id (propietario)
  test('3. PATCH /update-contact/:id debería actualizar un contacto si el usuario es el propietario', async () => {
    const updateData = { phone: '987-654-321' };
    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(updateData);
  });

  // 4. PATCH /update-contact/:id (no propietario)
  test('4. PATCH /update-contact/:id debería retornar 403 si NO es el propietario', async () => {

    // Sobrescribe el mock por defecto SOLO para este test
    mockGetDoc.mockResolvedValueOnce({
      exists: true,
      data: () => ({ ...MOCK_CONTACT_DATA, userId: 'otro-user-id' }),
    });

    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({ phone: '111-2222' });

    expect(response.statusCode).toBe(403);
  });

  // 5. PATCH /update-contact/:id (no existe)
  test('5. PATCH /update-contact/:id debería retornar 404 si el contacto no existe', async () => {

    // Sobrescribe el mock por defecto SOLO para este test
    mockGetDoc.mockResolvedValueOnce({ exists: false });

    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({ phone: '111-2222' });

    expect(response.statusCode).toBe(404);
  });

  // 6. PATCH /update-contact/:id (sin datos)
  test('6. PATCH /update-contact/:id debería retornar 400 si no se envían datos', async () => {
    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  // 7. DELETE /delete-contact/:id (propietario)
  test('7. DELETE /delete-contact/:id debería eliminar el contacto si es el propietario y retornar 204', async () => {

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(204);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  // 8. DELETE /delete-contact/:id (no propietario)
  test('8. DELETE /delete-contact/:id debería retornar 403 si NO es el propietario', async () => {

    // Sobrescribe el mock por defecto SOLO para este test
    mockGetDoc.mockResolvedValueOnce({
      exists: true,
      data: () => ({ ...MOCK_CONTACT_DATA, userId: 'otro-user-id' }),
    });

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(403);
  });

  // 9. DELETE /delete-contact/:id (no existe)
  test('9. DELETE /delete-contact/:id debería retornar 404 si el contacto no existe', async () => {

    // Sobrescribe el mock por defecto SOLO para este test
    mockGetDoc.mockResolvedValueOnce({ exists: false });

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(404);
  });
});