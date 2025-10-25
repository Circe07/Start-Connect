const { admin } = require('../firebase');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verificar si el encabezado existe y tiene el formato correcto (Bearer)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Devuelve el codigo 401 si es que el token es de formato incorrecto en formato JSON
    return res.status(401).json({
      message: 'Token no proporcionado o formato incorrecto (esperado: Bearer <token>)',
    });
  }

  // Extraemos solamente el token, la parte despues del Bearer
  const token = authHeader.split(' ')[1];

  try {

    // Descodificamos el token y verificamos la firma
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Adjuntamos el token decodificado al objeto de solicitud
    req.user = decodedToken;

    // Continuar con la siguiente función middleware
    next();

  } catch (error) {
    // Manejo de errores de verificación de tokens (expirados, inválidos, , , ,)
    // Lo registramos en consola para depuracion
    console.error('Error al verificar el token de Firebase:', error);

    // Establecemos unos mensajes de error default
    let errorMessage = 'No autorizado: El token es inválido.';
    let errorCode = error.code;

    // Manejo de errores específicos
    // Si el token ha expirado, lanzamos un mensaje de error
    if (errorCode === 'auth/id-token-expired') {
      errorMessage = 'No autorizado: El token ha expirado.';
    } else if (errorCode === 'app/no-app') {
      // Este caso es crucial para el debugging en desarrollo/testing (debería ser resuelto por el mock)
      errorMessage = 'Error de Configuración: La aplicación Firebase Admin no está inicializada correctamente.';
    }

    // Devolvemos el codigo 401 en formato JSON y los errores predeterminados
    return res.status(401).json({
      message: errorMessage,
      code: errorCode
    });
  }
};

module.exports = authMiddleware; // Exportamos el Middleware
