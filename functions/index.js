// Archivo principal de Cloud Functions (API Express).

const { setGlobalOptions } = require("firebase-functions/v2/options");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const express = require("express");
const cors = require("cors");

// Configuración global (seguridad y rendimiento)
setGlobalOptions({
    region: "europe-west1",
    maxInstances: 10,
});

// Inicializa la app Express
const app = express();

// Middlewares globales
app.use(cors({ origin: true }));
app.use(express.json());

const contactsRoutes = require("./src/routes/contacts");
const groupsRoutes = require("./src/routes/groups");

// Monta las rutas en /api/contacts
app.use("/contacts", contactsRoutes);
// Monta las rutas en /api/groups
app.use("/groups", groupsRoutes);

// Ruta de prueba raíz
app.get("/", (req, res) => {
    logger.info("API Start&Connect en ejecución");
    res.status(200).json({
        status: "ok",
        message: "Start&Connect API (Firebase Functions v2) funcionando correctamente",
    });
});

// Exporta la función HTTP principal
exports.api = onRequest(app);
