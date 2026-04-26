const rateLimit = require('express-rate-limit');

function envInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const v = parseInt(raw, 10);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Basic anti-bruteforce limiter for auth endpoints.
 *
 * Env:
 * - AUTH_RATE_LIMIT_WINDOW_MS (default 60000)
 * - AUTH_RATE_LIMIT_MAX (default 10)
 */
exports.authRateLimit = rateLimit({
  windowMs: envInt('AUTH_RATE_LIMIT_WINDOW_MS', 60_000),
  max: envInt('AUTH_RATE_LIMIT_MAX', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
});

function createLimiter({ windowEnv, maxEnv, defaultWindowMs, defaultMax, message }) {
  return rateLimit({
    windowMs: envInt(windowEnv, defaultWindowMs),
    max: envInt(maxEnv, defaultMax),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });
}

exports.writeRateLimit = createLimiter({
  windowEnv: 'WRITE_RATE_LIMIT_WINDOW_MS',
  maxEnv: 'WRITE_RATE_LIMIT_MAX',
  defaultWindowMs: 60_000,
  defaultMax: 120,
  message: 'Demasiadas operaciones de escritura. Inténtalo de nuevo más tarde.',
});

exports.readRateLimit = createLimiter({
  windowEnv: 'READ_RATE_LIMIT_WINDOW_MS',
  maxEnv: 'READ_RATE_LIMIT_MAX',
  defaultWindowMs: 60_000,
  defaultMax: 300,
  message: 'Demasiadas consultas. Inténtalo de nuevo más tarde.',
});
