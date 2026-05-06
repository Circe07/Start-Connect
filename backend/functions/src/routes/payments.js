const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { idempotencyMiddleware } = require('../middleware/idempotency');
const {
  createCheckout,
  handleStripeWebhook,
  getPaymentStatus,
} = require('../controllers/payments.controller');

router.post('/webhook', handleStripeWebhook);
router.post('/checkout', authMiddleware, idempotencyMiddleware(), createCheckout);
router.get('/:bookingId/status', authMiddleware, getPaymentStatus);

module.exports = router;
