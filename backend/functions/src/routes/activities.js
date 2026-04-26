const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { listActivities } = require('../controllers/activities.controller');

router.get('/check', (req, res) => {
  return res.status(200).json({ success: true, message: 'Rutas de activities cargadas' });
});

router.get('/', authMiddleware, listActivities);

module.exports = router;
