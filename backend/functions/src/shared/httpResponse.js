function ok(res, data, status = 200, requestId) {
  return res.status(status).json({
    success: true,
    data,
    requestId,
  });
}

function fail(
  res,
  { code = 'REQUEST_ERROR', message = 'Error.', status = 400, details = null } = {},
  requestId
) {
  return res.status(status).json({
    success: false,
    code,
    message,
    details,
    requestId,
  });
}

module.exports = { ok, fail };
