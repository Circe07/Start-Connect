// Archivo de prueba para el middleware de autenticación (auth.js)
// Usamos Jest para el testing.

// ----------------------------------------------------------------------
// 1. MOCKS: Simulación de Firebase Admin SDK
// ----------------------------------------------------------------------

// 1.1. Creamos un mock para la función clave de verificación de token
const mockVerifyIdToken = jest.fn();

// 1.2. Mockeamos el módulo de Firebase (la ruta corregida '../../src/firebase')
// Configuramos el mock para que admin.auth() devuelva un objeto con nuestra función mockeada.
// Esto debe hacerse ANTES de importar el middleware que depende de él.
jest.mock('../../functions/src/config/firebase.js', () => {
  // Implementación del mock más robusta para evitar el error 'app/no-app'
  const mockAuthService = {
    verifyIdToken: mockVerifyIdToken,
  };

  const mockAdmin = {
    // Crucial: 'apps' simulando que una aplicación por defecto ya existe.
    apps: [{ name: '__app__' }],

    // Simulación de admin.auth() (el acceso directo)
    auth: jest.fn(() => mockAuthService),

    // Simulación de admin.app().auth() en caso de que el wrapper lo use.
    app: jest.fn(() => ({
      auth: jest.fn(() => mockAuthService),
    })),

    // Stubs adicionales
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
  };

  return {
    // Asumimos que '../../src/firebase' exporta { admin }
    admin: mockAdmin,
  };
});

// Importamos el middleware DESPUÉS de haber mockeado sus dependencias
const authMiddleware = require('../../functions/src/config/firebase');

// Datos de prueba que simulan un token decodificado
const mockDecodedToken = { uid: 'test-user-uid', email: 'test@example.com', name: 'Test User' };

// ----------------------------------------------------------------------
// 2. SUITE DE PRUEBAS
// ----------------------------------------------------------------------

describe('authMiddleware', () => {
  let req, res, next;

  // Configuración de los objetos Express antes de cada prueba
  beforeEach(() => {
    // req: objeto de solicitud
    req = { headers: {} };
    // res: objeto de respuesta simulado con funciones encadenables (status().json())
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    // next: función para indicar a Express que continúe
    next = jest.fn();

    // Limpieza de mocks para asegurar que las llamadas sean independientes
    mockVerifyIdToken.mockClear();
    next.mockClear();
    res.status.mockClear();
    res.json.mockClear();
  });

  // -----------------------------------------
  // Caso de Éxito
  // -----------------------------------------
  test('Debe llamar a next() y adjuntar req.user si el token es válido', async () => {
    // 1. Configuración de la solicitud y el mock
    req.headers.authorization = 'Bearer valid-test-token';
    // CRUCIAL: Aseguramos que el mock devuelva un valor resuelto para el éxito
    mockVerifyIdToken.mockResolvedValue(mockDecodedToken);

    // 2. Ejecución del middleware
    await authMiddleware(req, res, next);

    // 3. Verificaciones
    // El mock DEBE haber sido llamado con el token limpio
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-test-token');
    // El usuario debe estar adjunto
    expect(req.user).toEqual(mockDecodedToken);
    // Se debe haber llamado a next
    expect(next).toHaveBeenCalledTimes(1);
    // La respuesta nunca debe ser enviada
    expect(res.status).not.toHaveBeenCalled();
  });

  // -----------------------------------------
  // Casos de Fallo (Error 401)
  // -----------------------------------------

  test('FALLO: Debe devolver 401 si el encabezado Authorization está ausente', async () => {
    // req.headers.authorization es undefined por defecto

    await authMiddleware(req, res, next);

    // Verificaciones
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    // Verifica el mensaje de la primera cláusula if
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Token no proporcionado o formato incorrecto")
      })
    );
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  test('FALLO: Debe devolver 401 si el encabezado tiene formato incorrecto (no "Bearer")', async () => {
    req.headers.authorization = 'Basic token-incorrecto';

    await authMiddleware(req, res, next);

    // Verificaciones
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    // Verifica el mensaje de la primera cláusula if
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Token no proporcionado o formato incorrecto")
      })
    );
  });

  test('FALLO: Debe devolver 401 si la verificación falla por token genéricamente inválido', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    // Simula un error genérico (ej: token manipulado).
    // NOTA: El test ahora usará la nueva redacción del middleware.
    mockVerifyIdToken.mockRejectedValue(new Error('Firebase: ID token signature is invalid.'));

    await authMiddleware(req, res, next);

    // Verificaciones
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    // Debe devolver el mensaje por defecto del catch (Ajuste para coincidir con la redacción: "El token es inválido")
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("El token es inválido"),
      })
    );
  });

  test('FALLO: Debe devolver 401 con mensaje específico si el token ha expirado', async () => {
    req.headers.authorization = 'Bearer expired-token';
    // Simula el error específico de expiración de Firebase
    const expiredError = new Error('Token expired');
    expiredError.code = 'auth/id-token-expired';
    mockVerifyIdToken.mockRejectedValue(expiredError);

    await authMiddleware(req, res, next);

    // Verificaciones
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    // Debe devolver el mensaje específico de token expirado (Ajuste para coincidir con la redacción: "El token ha expirado")
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("El token ha expirado"),
        code: 'auth/id-token-expired',
      })
    );
  });
});
