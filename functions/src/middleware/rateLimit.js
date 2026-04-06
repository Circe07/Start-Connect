const rateLimit = require("express-rate-limit");

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
  windowMs: envInt("AUTH_RATE_LIMIT_WINDOW_MS", 60_000),
  max: envInt("AUTH_RATE_LIMIT_MAX", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos. Inténtalo de nuevo más tarde." }
});

