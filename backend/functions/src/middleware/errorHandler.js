function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err?.statusCode || err?.status || 500;
  const message = status >= 500 ? 'Error interno.' : err?.message || 'Error.';
  const code = err?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');

  if (status >= 500) {
    // Keep details only in logs
    console.error('Unhandled error:', { requestId: req?.requestId, err });
  }

  return res.status(status).json({
    success: false,
    code,
    message,
    requestId: req?.requestId,
  });
}

module.exports = errorHandler;
