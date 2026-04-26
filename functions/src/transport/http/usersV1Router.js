const express = require('express');
const { ok, fail } = require('./responseContract');

function createUsersV1Router({ getMyProfile, updateMyProfile, getUserProfile }) {
  const router = express.Router();

  router.get('/me', async (req, res) => {
    try {
      const uid = req.headers['x-user-uid'] || req.user?.uid || null;
      const result = await getMyProfile.execute({ uid });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.patch('/me', async (req, res) => {
    try {
      const uid = req.headers['x-user-uid'] || req.user?.uid || null;
      const result = await updateMyProfile.execute({ uid, body: req.body });
      return ok(res, { success: true, message: result.message }, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.get('/:uid', async (req, res) => {
    try {
      const requesterUid = req.headers['x-user-uid'] || req.user?.uid || null;
      const targetUid = req.params.uid;
      const result = await getUserProfile.execute({ requesterUid, targetUid });
      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  return router;
}

module.exports = { createUsersV1Router };
