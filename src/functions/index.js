/**
 * Archivo principal (index.js) de Cloud Functions.
 * Configura Express.js y exporta la función 'api'.
 */
const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https"); // Usamos v2
const logger = require("firebase-functions/logger");

// 1. Importa Express
const express = require('express');

// Configuración global (límite de instancias)
setGlobalOptions({ maxInstances: 10 });

// 2. Inicializa la aplicación Express
const app = express();

// Middleware (opcional pero recomendado)
app.use(express.json()); // Permite a Express leer cuerpos JSON

// 3. Define tus rutas (Ejemplo: la ruta /users)
// NOTA: Gracias a firebase.json, si accedes a /api/users, Express solo ve /users.
app.get('/users', (req, res) => {
    logger.info("Petición GET recibida en /users");
    
    // Aquí es donde iría la lógica de Firestore
    
    // Respuesta JSON de ejemplo
    res.status(200).json({ 
        message: "¡API funcionando y ruta /users alcanzada!",
        data: [{ id: 1, name: "Usuario de Prueba" }]
    });
});

// 4. Exporta la función HTTP con el nombre 'api'
// Este nombre DEBE coincidir con el campo "function": "api" en firebase.json
exports.api = onRequest(app);

// Si utilizas la API v1 (onRequest de firebase-functions), la exportación sería:
// const functions = require("firebase-functions");
// exports.api = functions.https.onRequest(app);