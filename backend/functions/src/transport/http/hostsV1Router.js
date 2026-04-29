const express = require('express');
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');

function sendError(res, error) {
  return res.status(error.status || 500).json({ message: error.message || 'Error interno.' });
}

function createHostsV1Router({ createHost, updateHost, listHosts, getHostById }) {
  const router = express.Router();

  router.get('/', authMiddleware, async (_, res) => {
    try {
      const result = await listHosts.execute();
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const result = await getHostById.execute({ id: req.params.id });
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return sendError(res, error);
    }
  });
  router.post('/', adminMiddleware, async (req, res) => {
    try {
      const host = await createHost.execute(req.body || {});
      return res.status(201).json({ success: true, host });
    } catch (error) {
      return sendError(res, error);
    }
  });
  router.patch('/:id', adminMiddleware, async (req, res) => {
    try {
      const host = await updateHost.execute({ id: req.params.id, patch: req.body || {} });
      return res.status(200).json({ success: true, host });
    } catch (error) {
      return sendError(res, error);
    }
  });
  return router;
}

module.exports = { createHostsV1Router };
