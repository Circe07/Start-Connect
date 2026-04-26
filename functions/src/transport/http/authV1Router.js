const express = require('express');
const { ok, fail } = require('./responseContract');

function createAuthV1Router({ refreshSession, loginSession, getMe, logoutSession }) {
  const router = express.Router();

  function getUidFromRequest(req) {
    return req.headers['x-user-uid'] || req.user?.uid || null;
  }

  router.post('/login', async (req, res) => {
    try {
      const result = await loginSession.execute({
        email: req.body?.email,
        password: req.body?.password,
      });

      return ok(
        res,
        {
          success: true,
          token: result.token,
          refreshToken: result.refreshToken,
          uid: result.uid,
        },
        200,
        req.requestId
      );
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.post('/refresh', async (req, res) => {
    try {
      const result = await refreshSession.execute({
        refreshToken: req.body?.refreshToken,
      });

      return ok(
        res,
        {
          success: true,
          token: result.token,
          refreshToken: result.refreshToken,
          uid: result.uid,
        },
        200,
        req.requestId
      );
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const result = await getMe.execute({
        uid: getUidFromRequest(req),
      });

      return ok(res, result, 200, req.requestId);
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  router.post('/logout', async (req, res) => {
    try {
      const result = await logoutSession.execute({
        uid: getUidFromRequest(req),
      });

      return ok(
        res,
        {
          success: true,
          message: result.message,
        },
        200,
        req.requestId
      );
    } catch (error) {
      return fail(res, error, req.requestId);
    }
  });

  return router;
}

module.exports = { createAuthV1Router };
