const { fail } = require('../shared/httpResponse');

function notFoundHandler(req, res) {
  return fail(
    res,
    {
      code: 'NOT_FOUND',
      message: 'Ruta no encontrada',
      status: 404,
      details: null,
    },
    req.requestId
  );
}

module.exports = { notFoundHandler };
