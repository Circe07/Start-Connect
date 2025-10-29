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




// --- Rutas de la Aplicación ---
// Se montan en la raíz de Express (/)
app.use(require("./routes/users"));
app.use(require("./routes/groups")); 


module.exports = app;
