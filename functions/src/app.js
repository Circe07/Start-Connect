// src/app.js
const express = require("express");
const cors = require("cors");
const logger = require("firebase-functions/logger");

// Middlewares
const authMiddleware = require("./middleware/auth");

// Rutas
const contactsRoutes = require("./routes/contacts");
const groupsRoutes = require("./routes/groups");
const groupsRequestsRoutes = require("./routes/groupsRequests");
const authRoutes = require("./routes/auth");

const app = express();

// Middlewares globales
app.use(cors({ origin: true }));
app.use(express.json());

// Rutas públicas (no requieren token)
app.use("/auth", authRoutes);

// Middleware de autenticación (a partir de aquí TODO requiere token)
app.use(authMiddleware);

// Rutas privadas
app.use("/contacts", contactsRoutes);
app.use("/groups", groupsRoutes);
app.use("/groupsRequests", groupsRequestsRoutes);


// Ruta raíz
app.get("/", (req, res) => {
  logger.info("API Start&Connect en ejecución");
  res.status(200).json({
    status: "ok",
    message: "Start&Connect API (Firebase Functions v2) funcionando correctamente",
  });
});

module.exports = app;
