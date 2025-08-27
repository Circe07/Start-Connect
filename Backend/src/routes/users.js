// server/routes/users.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Ejemplo: obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
