const express = require('express');
const { AppError } = require('../../shared/AppError');

function createUsersV1Router({ getMyProfile }) {
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

  return router;
}

module.exports = { createUsersV1Router };
