const express = require('express');
const authMiddleware = require('../../middleware/auth');

function sendError(res, error) {
  return res.status(error.status || 500).json({ message: error.message || 'Error interno.' });
}

function createReferralsV1Router({ createReferral, listMyReferrals }) {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res) => {
    try {
      const referral = await createReferral.execute({
        user_id: req.user.uid,
        codigo: req.body?.codigo,
        referido_id: req.body?.referido_id || '',
        estado: req.body?.estado || 'pendiente',
        descuento_aplicado: req.body?.descuento_aplicado || false,
      });
      return res.status(201).json({ success: true, referral });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const result = await listMyReferrals.execute({ user_id: req.user.uid });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

module.exports = { createReferralsV1Router };
