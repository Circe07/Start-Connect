const express = require('express');
const { AppError } = require('../../shared/AppError');

function createGroupsV1Router({ getPublicGroups, joinGroup, sendGroupMessage, getGroupMessages }) {
  const router = express.Router();

  router.get('/public', async (req, res) => {
    try {
      const result = await getPublicGroups.execute({
        limit: req.query.limit,
        startAfterId: req.query.startAfterId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return mapError(error, res);
    }
  });

  router.post('/:id/join', async (req, res) => {
    try {
      const result = await joinGroup.execute({
        groupId: req.params.id,
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
      });
      return res.status(200).json(result);
    } catch (error) {
      return mapError(error, res);
    }
  });

  router.post('/:id/messages', async (req, res) => {
    try {
      const result = await sendGroupMessage.execute({
        groupId: req.params.id,
        uid: req.headers['x-user-uid'] || req.user?.uid || null,
        content: req.body?.content,
      });
      return res.status(201).json(result);
    } catch (error) {
      return mapError(error, res);
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

module.exports = { createGroupsV1Router };
