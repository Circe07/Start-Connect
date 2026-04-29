function idempotencyMiddleware({ ttlMs = 5 * 60 * 1000 } = {}) {
  const cache = new Map();

  return (req, res, next) => {
    if (req.method !== 'POST' && req.method !== 'PATCH') return next();

    const key = req.headers['idempotency-key'];
    if (!key || typeof key !== 'string') return next();

    const now = Date.now();
    for (const [cacheKey, entry] of cache.entries()) {
      if (now - entry.createdAt > ttlMs) cache.delete(cacheKey);
    }

    const existing = cache.get(key);
    if (existing) {
      return res.status(existing.status).json(existing.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, {
        status: res.statusCode,
        body,
        createdAt: Date.now(),
      });
      return originalJson(body);
    };

    return next();
  };
}

module.exports = { idempotencyMiddleware };
