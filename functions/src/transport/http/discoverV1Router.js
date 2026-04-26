const express = require('express');
const { ok, accepted, fail } = require('./responseContract');

function createDiscoverV1Router({ listActivities, recordSwipe, listMatches }) {
  const router = express.Router();

  router.get('/activities', async (req, res) => {
    try {
      const result = await listActivities.execute({
        city: req.query.city,
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.post('/swipes', async (req, res) => {
    try {
      const result = await recordSwipe.execute({
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        activityId: req.body?.activityId,
        direction: req.body?.direction,
      });
      return accepted(res, result, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.get('/matches', async (req, res) => {
    try {
      const result = await listMatches.execute({
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  return router;
}

module.exports = { createDiscoverV1Router };
