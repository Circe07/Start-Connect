const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { createFeedback, listFeedbackByExperience } = require('../controllers/feedback.controller');

router.get('/check', (_, res) => {
  return res.status(200).json({
    success: true,
    message: 'Rutas de feedback cargadas correctamente',
  });
});

router.post('/', authMiddleware, createFeedback);
router.get('/experience/:experienceId', adminMiddleware, listFeedbackByExperience);

module.exports = router;
