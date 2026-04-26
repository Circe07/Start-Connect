const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { listMatches } = require('../controllers/matches.controller');

router.get('/check', (req, res) => {
  return res.status(200).json({ success: true, message: 'Rutas de matches cargadas' });
});

router.get('/', authMiddleware, listMatches);

module.exports = router;
