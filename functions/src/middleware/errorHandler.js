function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const status = err?.statusCode || err?.status || 500;
  const message = status >= 500
    ? "Error interno."
    : (err?.message || "Error.");

  if (status >= 500) {
    // Keep details only in logs
    console.error("Unhandled error:", err);
  }

  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;

