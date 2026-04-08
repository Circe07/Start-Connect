const { AppError } = require('../../shared/AppError');

function ok(res, payload, status = 200, requestId) {
  const body = typeof payload === 'object' && payload !== null ? payload : { data: payload };
  if (requestId) body.requestId = requestId;
  return res.status(status).json(body);
}

function accepted(res, payload, requestId) {
  return ok(res, payload, 201, requestId);
}

function fail(res, error, requestId) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details || null,
      requestId,
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Error interno.',
    requestId,
  });
}

module.exports = { ok, accepted, fail };
