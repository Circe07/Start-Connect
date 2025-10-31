const { admin } = require("../firebase");

// Middleware de autenticación con Firebase
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Verificar formato del token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token no proporcionado o formato incorrecto (esperado: Bearer <token>)",
    });
  }

  // 2️⃣ Extraer el token
  const token = authHeader.split(" ")[1];

  try {
    // 3️⃣ Verificar el token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 4️⃣ Guardar los datos del usuario autenticado
    req.user = decodedToken;

    // 5️⃣ Continuar con la siguiente función middleware
    next();
  } catch (error) {
    console.error("Error al verificar el token de Firebase:", error);

    let errorMessage = "No autorizado: El token es inválido.";
    if (error.code === "auth/id-token-expired") {
      errorMessage = "No autorizado: El token ha expirado.";
    } else if (error.code === "app/no-app") {
      errorMessage = "Error de configuración: Firebase Admin no está inicializado correctamente.";
    }

    return res.status(401).json({ message: errorMessage, code: error.code });
  }
};

module.exports = authMiddleware;
