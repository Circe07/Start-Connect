const express = require('express');
const { ok, accepted, fail } = require('./responseContract');

function createGroupsV1Router({ getPublicGroups, joinGroup, sendGroupMessage, getGroupMessages }) {
  const router = express.Router();

  router.get('/public', async (req, res) => {
    try {
      const result = await getPublicGroups.execute({
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.post('/:id/join', async (req, res) => {
    try {
      const result = await joinGroup.execute({
        groupId: req.params.id,
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
      });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.post('/:id/messages', async (req, res) => {
    try {
      const result = await sendGroupMessage.execute({
        groupId: req.params.id,
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        content: req.body?.content,
      });
      return accepted(res, result, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.get('/:id/messages', async (req, res) => {
    try {
      const result = await getGroupMessages.execute({
        groupId: req.params.id,
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

module.exports = { createGroupsV1Router };
