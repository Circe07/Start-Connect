const express = require("express");
const morgan = require("morgan");
const cors = require('cors');

const app = express();

// --- Middlewares ---

// Habilita CORS para todas las solicitudes (IMPORTANTE para APIs)
app.use(cors());

// Logging de peticiones (útil para desarrollo)
app.use(morgan("dev"));

// Middleware para parsear cuerpos de solicitud JSON (API)
app.use(express.json());

// Middleware para parsear cuerpos de solicitud URL-encoded (Formularios)
// Se usa 'extended: true' para permitir objetos y arrays complejos
app.use(express.urlencoded({ extended: true }));



// Importacion de routes
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groups");

app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);



module.exports = app;
