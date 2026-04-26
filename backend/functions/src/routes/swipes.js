const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { recordSwipe } = require('../controllers/swipes.controller');

router.get('/check', (req, res) => {
  return res.status(200).json({ success: true, message: 'Rutas de swipes cargadas' });
});

router.post('/', authMiddleware, recordSwipe);

module.exports = router;
