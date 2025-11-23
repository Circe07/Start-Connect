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
const adminRoutes = require("./routes/admin");
const hobbiesRoutes = require("./routes/hobbies");
const usersRoutes = require("./routes/users");

const app = express();

// Middlewares globales
app.use(cors({ origin: true }));
app.use(express.json());

// Rutas públicas
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRoutes);

// Rutas privadas
app.use("/hobbies", hobbiesRoutes);
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
