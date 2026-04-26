function apiVersionV1(req, res, next) {
  res.setHeader('x-api-version', 'v1');
  next();
}

module.exports = { apiVersionV1 };
