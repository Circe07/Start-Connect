const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { createReferral, listMyReferrals } = require('../controllers/referrals.controller');

router.get('/check', (_, res) => {
  return res.status(200).json({
    success: true,
    message: 'Rutas de referrals cargadas correctamente',
  });
});

router.post('/', authMiddleware, createReferral);
router.get('/me', authMiddleware, listMyReferrals);

module.exports = router;
