const request = require('supertest');

let app; // lo cargamos después de los mocks

// Variables para mocks
let mockDocRef;
let mockCollection, mockFirestore;
let mockAdd;

// MOCKS DE FIRESTORE
jest.mock('../../src/firebase', () => {
  // -----------------------------------------------------------
  // MOCKS DE DOCUMENTO (GET, UPDATE, DELETE)
  // -----------------------------------------------------------
  const mockDocData = {
    exists: true,
    data: jest.fn(() => ({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      address: 'Calle Falsa 123',
      userId: 'mock-user-id',
    })),
  };

  // Simula la referencia de documento
  mockDocRef = {
    get: jest.fn(() => Promise.resolve(mockDocData)),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
  };

  // DEFINIMOS MOCK ADD AQUÍ
  mockAdd = jest.fn(() => Promise.resolve({ id: 'new-mock-id' }));

  // -----------------------------------------------------------
  // MOCKS DE COLECCIÓN (GET, ADD, DOC)
  // -----------------------------------------------------------
  mockCollection = jest.fn(() => ({
    // Para GET /api/users
    get: jest.fn(() => Promise.resolve({ docs: [{ id: 'mock-contact-id', data: mockDocData.data }] })),

    // USAMOS LA VARIABLE DEFINIDA
    add: mockAdd,

    // Para PATCH/DELETE /update-contact/:id
    doc: jest.fn(() => mockDocRef),
  }));

  mockFirestore = { collection: mockCollection };

  return { db: mockFirestore };
});

// Mock de autenticación
jest.mock('../../src/middleware/auth.js', () => {
  return function (req, res, next) {
    req.user = { uid: 'mock-user-id' };
    next();
  };
});

// Importar la app después de los mocks
const importedApp = require('../../src/app');
app = importedApp;

// Datos de prueba
const MOCK_CONTACT_ID = 'mock-contact-id';
const MOCK_CONTACT_DATA = {
  firstname: 'TestName',
  lastname: 'TestLastname',
  email: 'test@example.com',
  phone: '123-456-7890',
};

// Limpieza antes de cada test 
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  mockAdd.mockClear();

  mockDocRef.get.mockImplementation(() => Promise.resolve({
    exists: true,
    data: () => ({ ...MOCK_CONTACT_DATA, userId: 'mock-user-id' }),
    id: MOCK_CONTACT_ID
  }));
});

// ===========================================================================

describe('Pruebas para /api/users (Rutas de Contactos)', () => {

  test('1. GET /users debería retornar todos los contactos y status 200', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    // Utilizamos el mock de GET de la colección
    expect(mockCollection).toHaveBeenCalledWith('contacts');
  });

  test('2. POST /new-contact debería crear un nuevo contacto y retornar 201', async () => {
    const newContact = { ...MOCK_CONTACT_DATA };
    const response = await request(app)
      .post('/api/users/new-contact')
      .send(newContact);

    expect(response.statusCode).toBe(201);
    expect(mockAdd).toHaveBeenCalled();
    // Aseguramos que la respuesta contenga el ID del mock
    expect(response.body).toHaveProperty('id', 'new-mock-id');
  });

  test('3. PATCH /update-contact/:id debería actualizar un contacto si el usuario es el propietario', async () => {
    const updateData = { phone: '987-654-321' };
    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    // Aseguramos que se llamó a la función update
    expect(mockDocRef.update).toHaveBeenCalledWith(updateData);
  });

  test('4. PATCH /update-contact/:id debería retornar 403 si NO es el propietario', async () => {
    // Mockear el documento para que parezca que pertenece a otro usuario
    mockDocRef.get.mockImplementationOnce(() => Promise.resolve({
      exists: true,
      data: () => ({ ...MOCK_CONTACT_DATA, userId: 'otro-user' }),
    }));

    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({ phone: '111-2222' });

    expect(response.statusCode).toBe(403);
  });

  // --- 5. PATCH /update-contact/:id (no existe) ---
  test('5. PATCH /update-contact/:id debería retornar 404 si el contacto no existe', async () => {
    // Mockear el documento para que no exista
    mockDocRef.get.mockImplementationOnce(() => Promise.resolve({ exists: false }));

    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({ phone: '111-2222' });

    expect(response.statusCode).toBe(404);
  });

  // --- 6. PATCH /update-contact/:id (sin datos) ---
  test('6. PATCH /update-contact/:id debería retornar 400 si no se envían datos', async () => {
    const response = await request(app)
      .patch(`/api/users/update-contact/${MOCK_CONTACT_ID}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  // --- 7. DELETE /delete-contact/:id (propietario) ---
  test('7. DELETE /delete-contact/:id debería eliminar el contacto si es el propietario y retornar 204', async () => {
    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(204);
    expect(mockDocRef.delete).toHaveBeenCalledTimes(1);
  });

  // --- 8. DELETE /delete-contact/:id (no propietario) ---
  test('8. DELETE /delete-contact/:id debería retornar 403 si NO es el propietario', async () => {
    mockDocRef.get.mockImplementationOnce(() => Promise.resolve({
      exists: true,
      data: () => ({ ...MOCK_CONTACT_DATA, userId: 'otro-user' }),
    }));

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(403);
    expect(response.text).toContain('Prohibido');
  });

  // --- 9. DELETE /delete-contact/:id (no existe) ---
  test('9. DELETE /delete-contact/:id debería retornar 404 si el contacto no existe', async () => {
    mockDocRef.get.mockImplementationOnce(() => Promise.resolve({ exists: false }));

    const response = await request(app)
      .delete(`/api/users/delete-contact/${MOCK_CONTACT_ID}`);

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('Contacto no encontrado');
  });
});
