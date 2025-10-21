const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const morgan = require("morgan");

const app = express();

// Para parsear cuerpos de solicitud JSON
app.use(express.json());

// Para parsear cuerpos de solicitud URL-encoded (datos de formularios)
// El 'extended: true' permite objetos y arrays complejos.
app.use(express.urlencoded({ extended: true }));

// Settings
app.set("port", process.env.PORT || 3000);


// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api",require("./routes/users"));
app.use("/api",require("./routes/groups"));



module.exports = app;
