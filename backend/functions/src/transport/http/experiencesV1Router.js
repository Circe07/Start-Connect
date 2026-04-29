const express = require('express');
const adminMiddleware = require('../../middleware/admin');
const authMiddleware = require('../../middleware/auth');

function sendError(res, error) {
  return res.status(error.status || 500).json({ message: error.message || 'Error interno.' });
}

function createExperiencesV1Router({
  createExperience,
  publishExperience,
  updateExperience,
  listExperiences,
  getExperienceById,
}) {
  const router = express.Router();

  router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await listExperiences.execute({
        estado: req.query.estado,
        limit: req.query.limit,
      });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const result = await getExperienceById.execute({ id: req.params.id });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post('/', adminMiddleware, async (req, res) => {
    try {
      const experience = await createExperience.execute(req.body || {});
      return res.status(201).json({ success: true, experience });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch('/:id', adminMiddleware, async (req, res) => {
    try {
      const result = await updateExperience.execute({ id: req.params.id, patch: req.body || {} });
      return res.status(200).json({ success: true, experience: result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.patch('/:id/publish', adminMiddleware, async (req, res) => {
    try {
      const result = await publishExperience.execute({ id: req.params.id });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

module.exports = { createExperiencesV1Router };
