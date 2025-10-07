// middleware/auth.js (o dentro de tu archivo de rutas)
const admin = require("firebase-admin"); // Asegúrate de que admin esté disponible aquí

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send("No autorizado: Token no proporcionado o formato incorrecto.");
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Si el token es válido, adjunta la información del usuario a la solicitud
    req.user = decodedToken;
    next(); // Continúa con la siguiente función middleware o ruta
  } catch (error) {
    console.error("Error al verificar el token de Firebase:", error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send("No autorizado: El token ha expirado.");
    }
    return res.status(401).send("No autorizado: Token inválido.");
  }
};

module.exports = authMiddleware; // Exporta si lo pones en un archivo separado
