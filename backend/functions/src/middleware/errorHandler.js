const { fail } = require('../shared/httpResponse');

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err?.statusCode || err?.status || 500;
  const message = status >= 500 ? 'Error interno.' : err?.message || 'Error.';
  const code = err?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');

  if (status >= 500) {
    // Keep details only in logs
    console.error('Unhandled error:', { requestId: req?.requestId, err });
  }

  return fail(
    res,
    {
      code,
      message,
      status,
      details: err?.details || null,
    },
    req?.requestId
  );
}

module.exports = errorHandler;
