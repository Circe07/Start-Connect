const express = require('express');
const { AppError } = require('../../shared/AppError');

function createDiscoverV1Router({ listActivities, recordSwipe, listMatches }) {
  const router = express.Router();

  router.get('/activities', async (req, res) => {
    try {
      const result = await listActivities.execute({
        city: req.query.city,
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return mapError(error, res);
    }
  });

  router.post('/swipes', async (req, res) => {
    try {
      const result = await recordSwipe.execute({
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        activityId: req.body?.activityId,
        direction: req.body?.direction,
      });
      return res.status(201).json(result);
    } catch (error) {
      return mapError(error, res);
    }
  });

  router.get('/matches', async (req, res) => {
    try {
      const result = await listMatches.execute({
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return mapError(error, res);
    }
  });

  return router;
}

function mapError(error, res) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Error interno.',
  });
}

module.exports = { createDiscoverV1Router };
