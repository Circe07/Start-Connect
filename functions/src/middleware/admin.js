const { admin } = require("../config/firebase");

// Middleware para verificar rol de Administrador
const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Verificar Custom Claim 'role'
        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ message: "Acceso denegado. Se requieren privilegios de administrador." });
        }

        req.user = decodedToken;
        next();

    } catch (error) {
        console.error("Error adminMiddleware:", error);
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = adminMiddleware;
