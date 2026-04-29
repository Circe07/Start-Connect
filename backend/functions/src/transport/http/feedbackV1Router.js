const express = require('express');
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');

function sendError(res, error) {
  return res.status(error.status || 500).json({ message: error.message || 'Error interno.' });
}

function createFeedbackV1Router({ createFeedback, listFeedbackByExperience }) {
  const router = express.Router();

  router.post('/', authMiddleware, async (req, res) => {
    try {
      const feedback = await createFeedback.execute({ user_id: req.user.uid, ...req.body });
      return res.status(201).json({ success: true, feedback });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get('/experience/:experienceId', adminMiddleware, async (req, res) => {
    try {
      const result = await listFeedbackByExperience.execute({
        experience_id: req.params.experienceId,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

module.exports = { createFeedbackV1Router };
