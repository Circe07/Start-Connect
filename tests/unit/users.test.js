const request = require('supertest');

// --- 1. Mocks de Funciones Finales ---
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockGetCollection = jest.fn();
const mockGetDoc = jest.fn();

// --- 2. Mocks de Estructura de Firestore ---
// .../contacts/{contactId}
const mockContactDocRef = {
  get: mockGetDoc,
  update: mockUpdate,
  delete: mockDelete,
};

// .../contacts
const mockContactsCollectionRef = {
  get: mockGetCollection,
  add: mockAdd,
  doc: jest.fn(() => mockContactDocRef),
};

// .../User/{userId}
const mockUserDocRef = {
  collection: jest.fn((collectionName) => {
    if (collectionName === 'contacts') {
      return mockContactsCollectionRef;
    }
  }),
};

// .../User (Colección)
const mockUserCollectionRef = {
  doc: jest.fn(() => mockUserDocRef),
};

// .../User (Documento)
const mockAppbaseDocRef = {
  collection: jest.fn((collectionName) => {
    if (collectionName === 'User') {
      return mockUserCollectionRef;
    }
  }),
};

// --- 3. Mock Principal de 'firebase' ---
// 🚨 CORRECCIÓN CLAVE: El mock principal debe tener una estructura que permita acceder a la función db.collection.
const mockDb = {
  collection: jest.fn((collectionName) => {
    if (collectionName === 'appbase') {
      return {
        doc: jest.fn((docName) => {
          if (docName === 'User') {
            return mockAppbaseDocRef;
          }
        }),
        // 🚨 SIMPLIFICACIÓN: Para el test GET, la función db.collection('general_contacts') es la que se usa.
      };
    }
    // Ruta simplificada para la solución del 5 NOT_FOUND:
    if (collectionName === 'general_contacts') {
      return mockContactsCollectionRef;
    }
  }),
};


jest.mock('../../src/firebase', () => ({
  db: mockDb,
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

  // 🚨 CORRECCIÓN GET COLLECTION: Devuelve el objeto que tiene la propiedad 'docs'
  mockGetCollection.mockResolvedValue({
    docs: [
      {
        id: MOCK_CONTACT_ID,
        data: () => (MOCK_CONTACT_DATA),
      },
    ],
  });

  // 🚨 CORRECCIÓN GET DOC: El doc de contacto devuleve los datos para la verificación de propiedad
  mockGetDoc.mockResolvedValue({
    exists: true,
    data: () => ({ userId: 'mock-user-id' }),
  });

  mockAdd.mockResolvedValue({ id: 'new-mock-id' });
  mockUpdate.mockResolvedValue();
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
    expect(response.body).toHaveProperty('id', 'new-mock-id');
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

    mockGetDoc.mockResolvedValueOnce({ exists: false });

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(404);
  });
});