// server/server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Importar Firebase
const { admin, db } = require('./firebase');

// Importar rutas
const usersRouter = require('./routes/users');

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/users', usersRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Server funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
