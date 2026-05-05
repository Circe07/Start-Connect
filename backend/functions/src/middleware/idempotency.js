const crypto = require('crypto');

function shouldUseMemoryStore() {
  return (
    process.env.IDEMPOTENCY_STORE === 'memory' || typeof process.env.JEST_WORKER_ID !== 'undefined'
  );
}

/** Implementación en memoria (una sola instancia; tests Jest). */
function memoryIdempotencyMiddleware({ ttlMs = 5 * 60 * 1000 } = {}) {
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

async function waitForCompletion(docRef, { timeoutMs = 5000, intervalMs = 50 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const snap = await docRef.get();
    if (!snap.exists) return null;
    const d = snap.data();
    if (d && d.pending !== true && d.responseBody != null && d.statusCode != null) {
      return d;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

/**
 * Idempotencia repartible entre instancias Cloud Run usando Firestore.
 * Clave de documento: SHA-256 de uid + método + URL + header Idempotency-Key.
 */
function firestoreIdempotencyMiddleware({ ttlMs = 5 * 60 * 1000 } = {}) {
  const { db, FieldValue } = require('../config/firebase');
  const { Timestamp } = require('firebase-admin/firestore');

  const COLLECTION = 'api_idempotency';

  return async (req, res, next) => {
    if (req.method !== 'POST' && req.method !== 'PATCH') return next();

    const rawKey = req.headers['idempotency-key'];
    if (!rawKey || typeof rawKey !== 'string') return next();

    const uid = req.user?.uid || 'anon';
    const path = req.originalUrl || req.url || '';
    const scope = `${uid}:${req.method}:${path}:${rawKey}`;
    const hash = crypto.createHash('sha256').update(scope).digest('hex');
    const docRef = db.collection(COLLECTION).doc(hash);
    const expiresAt = Timestamp.fromMillis(Date.now() + ttlMs);

    try {
      const snap = await docRef.get();
      if (snap.exists) {
        const d = snap.data();
        const notExpired = d.expiresAt && d.expiresAt.toMillis() > Date.now();
        if (!notExpired) {
          await docRef.delete();
        } else if (d.responseBody != null && d.statusCode != null && d.pending !== true) {
          return sendStoredJson(res, d.statusCode, d.responseBody);
        } else if (d.pending === true) {
          const done = await waitForCompletion(docRef, { timeoutMs: Math.min(ttlMs, 8000) });
          if (done) {
            return sendStoredJson(res, done.statusCode, done.responseBody);
          }
          return res
            .status(409)
            .json({ message: 'Idempotency key en proceso; reintenta en breve.' });
        }
      }
    } catch (err) {
      return next(err);
    }

    try {
      await docRef.create({
        pending: true,
        expiresAt,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      if (e.code === 6 || e.code === 'ALREADY_EXISTS') {
        const done = await waitForCompletion(docRef, { timeoutMs: Math.min(ttlMs, 8000) });
        if (done && done.responseBody != null) {
          return sendStoredJson(res, done.statusCode, done.responseBody);
        }
        return res
          .status(409)
          .json({ message: 'Solicitud duplicada o idempotencia en conflicto.' });
      }
      return next(e);
    }

    let responseCommitted = false;
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseCommitted = true;
      const payload = {
        pending: false,
        statusCode: res.statusCode,
        responseBody: typeof body === 'string' ? body : JSON.stringify(body),
        expiresAt,
        completedAt: FieldValue.serverTimestamp(),
      };
      docRef
        .set(payload, { merge: true })
        .catch((err) => console.error('idempotency persist', err));
      return originalJson(body);
    };

    const cleanup = () => {
      if (responseCommitted) return;
      docRef.delete().catch(() => {});
    };
    res.once('finish', cleanup);
    res.once('close', cleanup);

    return next();
  };
}

function sendStoredJson(res, statusCode, responseBody) {
  let body;
  try {
    body = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
  } catch {
    body = { message: 'Respuesta idempotente no parseable' };
  }
  return res.status(statusCode).json(body);
}

function idempotencyMiddleware(opts) {
  if (shouldUseMemoryStore()) {
    return memoryIdempotencyMiddleware(opts);
  }
  return firestoreIdempotencyMiddleware(opts);
}

module.exports = { idempotencyMiddleware };
