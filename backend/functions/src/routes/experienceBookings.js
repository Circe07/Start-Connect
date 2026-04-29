const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { idempotencyMiddleware } = require('../middleware/idempotency');
const {
  createExperienceBooking,
  listMyExperienceBookings,
  listExperienceBookingsByExperience,
  updateExperienceBookingStatus,
  cancelExperienceBooking,
} = require('../controllers/experienceBookings.controller');

router.get('/check', (_, res) => {
  return res.status(200).json({
    success: true,
    message: 'Rutas de experience-bookings cargadas correctamente',
  });
});

router.post('/', authMiddleware, idempotencyMiddleware(), createExperienceBooking);
router.get('/me', authMiddleware, listMyExperienceBookings);
router.get('/experience/:experienceId', adminMiddleware, listExperienceBookingsByExperience);
router.patch('/:id/status', adminMiddleware, updateExperienceBookingStatus);
router.patch('/:id/cancel', authMiddleware, cancelExperienceBooking);

module.exports = router;
