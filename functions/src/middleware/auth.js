/**
 * Authentication Middleware
 * This middleware is responsible for verifying user authentication with Firebase.
 * Author: Unai Villar
 */

const { admin } = require("../config/firebase");

const authMiddleware = async (req, res, next) => {
  let errorMessage = "No autorizado: El token es inválido.";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token no proporcionado o formato incorrecto (esperado: Bearer <token>)",
    });
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Error al verificar el token de Firebase:", error);

    if (error.code === "auth/id-token-expired") {
      errorMessage = "No autorizado: El token ha expirado.";
    } else if (error.code === "app/no-app") {
      errorMessage = "Error de configuración: Firebase Admin no está inicializado correctamente.";
    }

    return res.status(401).json({ message: errorMessage, code: error.code });
  }
};

module.exports = authMiddleware;
