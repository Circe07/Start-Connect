const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  createExperience,
  publishExperience,
  updateExperience,
  listExperiences,
  getExperienceById,
} = require('../controllers/experiences.controller');

router.get('/check', (_, res) => {
  return res.status(200).json({
    success: true,
    message: 'Rutas de experiences cargadas correctamente',
  });
});

router.get('/', authMiddleware, listExperiences);
router.get('/:id', authMiddleware, getExperienceById);
router.post('/', adminMiddleware, createExperience);
router.patch('/:id', adminMiddleware, updateExperience);
router.patch('/:id/publish', adminMiddleware, publishExperience);

module.exports = router;
