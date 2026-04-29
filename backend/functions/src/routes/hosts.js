const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  createHost,
  updateHost,
  listHosts,
  getHostById,
} = require('../controllers/hosts.controller');

router.get('/check', (_, res) => {
  return res.status(200).json({
    success: true,
    message: 'Rutas de hosts cargadas correctamente',
  });
});

router.get('/', authMiddleware, listHosts);
router.get('/:id', authMiddleware, getHostById);
router.post('/', adminMiddleware, createHost);
router.patch('/:id', adminMiddleware, updateHost);

module.exports = router;
