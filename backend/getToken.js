/**
 * Imprime idTokens en consola vía POST /auth/login (no usa Firebase Web API key).
 *
 * Credenciales: backend/functions/.env
 *   POSTMAN_ADMIN_EMAIL, POSTMAN_ADMIN_PASSWORD (y opcionalmente POSTMAN_USER_*)
 *
 * Uso: node getToken.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'functions/.env') });

const baseUrl = (process.env.POSTMAN_BASE_URL || 'https://api-ma5t57vzsq-ew.a.run.app').replace(
  /\/$/,
  ''
);

const pairs = [
  ['POSTMAN_ADMIN_EMAIL', 'POSTMAN_ADMIN_PASSWORD', 'admin'],
  ['POSTMAN_USER_EMAIL', 'POSTMAN_USER_PASSWORD', 'usuario'],
];

(async () => {
  for (const [emailKey, passKey, label] of pairs) {
    const email = process.env[emailKey];
    const password = process.env[passKey];
    if (!email || !password) {
      console.warn(`Omitido (${label}): define ${emailKey} y ${passKey} en functions/.env`);
      continue;
    }
    try {
      console.log(`\n🔐 Login ${label} (${email})…`);
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || String(res.status));
      console.log('-----------------------------------------');
      console.log(`✅ Token (${label})`);
      console.log(body.token);
      console.log('-----------------------------------------');
    } catch (e) {
      console.error(`❌ ${label}:`, e.message);
    }
  }
  process.exit(0);
})();
