const express = require('express');
const { AppError } = require('../../shared/AppError');

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

      return res.status(200).json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken,
        uid: result.uid,
      });
    } catch (error) {
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
  });

  router.post('/refresh', async (req, res) => {
    try {
      const result = await refreshSession.execute({
        refreshToken: req.body?.refreshToken,
      });

      return res.status(200).json({
        success: true,
        token: result.token,
        refreshToken: result.refreshToken,
        uid: result.uid,
      });
    } catch (error) {
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
  });

  router.get('/me', async (req, res) => {
    try {
      const result = await getMe.execute({
        uid: getUidFromRequest(req),
      });

      return res.status(200).json(result);
    } catch (error) {
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
  });

  router.post('/logout', async (req, res) => {
    try {
      const result = await logoutSession.execute({
        uid: getUidFromRequest(req),
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
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
  });

  return router;
}

module.exports = { createAuthV1Router };
