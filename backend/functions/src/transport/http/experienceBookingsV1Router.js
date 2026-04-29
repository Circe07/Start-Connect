const express = require('express');
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');

function sendError(res, error) {
  return res.status(error.status || 500).json({ message: error.message || 'Error interno.' });
}

function createExperienceBookingsV1Router({
  createExperienceBooking,
  updateExperienceBookingStatus,
  cancelExperienceBooking,
  listMyExperienceBookings,
  listExperienceBookingsByExperience,
}) {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res) => {
    try {
      const booking = await createExperienceBooking.execute({
        user_id: req.user.uid,
        ...req.body,
      });
      return res.status(201).json({ success: true, booking });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const result = await listMyExperienceBookings.execute({ user_id: req.user.uid });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get('/experience/:experienceId', adminMiddleware, async (req, res) => {
    try {
      const result = await listExperienceBookingsByExperience.execute({
        experience_id: req.params.experienceId,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch('/:id/status', adminMiddleware, async (req, res) => {
    try {
      const result = await updateExperienceBookingStatus.execute({
        id: req.params.id,
        estado: req.body?.estado,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch('/:id/cancel', authMiddleware, async (req, res) => {
    try {
      const result = await cancelExperienceBooking.execute({ id: req.params.id });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

module.exports = { createExperienceBookingsV1Router };
