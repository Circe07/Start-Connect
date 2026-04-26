function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Ruta no encontrada',
    requestId: req.requestId,
  });
}

module.exports = { notFoundHandler };
