const express = require('express');
const { AppError } = require('../../shared/AppError');

function createUsersV1Router({ getMyProfile, updateMyProfile, getUserProfile }) {
  const router = express.Router();

  router.get('/me', async (req, res) => {
    try {
      const uid = req.headers['x-user-uid'] || req.user?.uid || null;
      const result = await getMyProfile.execute({ uid });
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

  router.patch('/me', async (req, res) => {
    try {
      const uid = req.headers['x-user-uid'] || req.user?.uid || null;
      const result = await updateMyProfile.execute({ uid, body: req.body });
      return res.status(200).json({ success: true, message: result.message });
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

  router.get('/:uid', async (req, res) => {
    try {
      const requesterUid = req.headers['x-user-uid'] || req.user?.uid || null;
      const targetUid = req.params.uid;
      const result = await getUserProfile.execute({ requesterUid, targetUid });
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

  return router;
}

module.exports = { createUsersV1Router };
