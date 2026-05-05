/**
 * Obtiene idTokens con POST /auth/login (sin Firebase Web API key en cliente)
 * y escribe adminToken / userToken en el entorno Postman de experiences e2e.
 *
 * Variables (primera fuente gana; también sirven variables ya exportadas en la shell):
 *   backend/functions/.env → backend/.env → raíz del repo /.env
 *
 *   POSTMAN_BASE_URL           — opcional
 *   POSTMAN_ADMIN_EMAIL / POSTMAN_ADMIN_PASSWORD
 *   POSTMAN_USER_EMAIL / POSTMAN_USER_PASSWORD
 *
 * Uso: desde backend/: npm run postman:update-tokens
 */

const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');

/** Orden: repo → backend → functions. La última lectura gana (dotenv no pisa variables ya fijadas). */
function loadEnvFiles() {
  const candidates = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../functions/.env'),
  ];
  const status = [];
  for (const p of candidates) {
    const exists = fs.existsSync(p);
    status.push({ path: p, exists });
    if (exists) dotenv.config({ path: p, override: true });
  }
  return status;
}

const envFileStatus = loadEnvFiles();

const ENV_FILE = path.join(
  __dirname,
  '../../testing/backend/experiences-e2e-smoke.postman_environment.json'
);

function env(name, fallback = '') {
  const v = process.env[name];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

async function login(baseUrl, email, password) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  if (!body.token) throw new Error('Respuesta sin token');
  return body.token;
}

function setValue(values, key, value) {
  const row = values.find((v) => v.key === key);
  if (row) row.value = value;
  else values.push({ key, value, enabled: true });
}

(async () => {
  const baseUrl = env('POSTMAN_BASE_URL', 'https://api-ma5t57vzsq-ew.a.run.app').replace(/\/$/, '');

  const adminEmail = env('POSTMAN_ADMIN_EMAIL');
  const adminPassword = env('POSTMAN_ADMIN_PASSWORD');
  const userEmail = env('POSTMAN_USER_EMAIL');
  const userPassword = env('POSTMAN_USER_PASSWORD');

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    console.error('Faltan una o más variables POSTMAN_*.\n');
    console.error('Archivos .env comprobados:');
    for (const { path: p, exists } of envFileStatus) {
      console.error(`  ${exists ? '✓' : '✗'} ${p}`);
    }
    console.error(
      '\nAñade en backend/functions/.env (crea el archivo si no existe), por ejemplo:\n' +
        '  POSTMAN_BASE_URL=https://api-ma5t57vzsq-ew.a.run.app\n' +
        '  POSTMAN_ADMIN_EMAIL=tu-cuenta-admin@...\n' +
        '  POSTMAN_ADMIN_PASSWORD=tu_contraseña\n' +
        '  POSTMAN_USER_EMAIL=tu-cuenta-usuario@...\n' +
        '  POSTMAN_USER_PASSWORD=tu_contraseña\n' +
        '\n(Plantilla: backend/functions/.env.example)\n' +
        '\nEn PowerShell sin guardar contraseñas en archivo:\n' +
        '  $env:POSTMAN_ADMIN_EMAIL="..."; $env:POSTMAN_ADMIN_PASSWORD="..."; ' +
        '$env:POSTMAN_USER_EMAIL="..."; $env:POSTMAN_USER_PASSWORD="..."; npm run postman:update-tokens\n'
    );
    process.exit(1);
  }

  console.log(`Base URL: ${baseUrl}`);
  console.log('Obteniendo token admin…');
  const adminToken = await login(baseUrl, adminEmail, adminPassword);
  console.log('Obteniendo token usuario…');
  const userToken = await login(baseUrl, userEmail, userPassword);

  const raw = fs.readFileSync(ENV_FILE, 'utf8');
  const data = JSON.parse(raw);
  setValue(data.values, 'baseUrl', baseUrl);
  setValue(data.values, 'adminToken', adminToken);
  setValue(data.values, 'userToken', userToken);

  fs.writeFileSync(ENV_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`\nActualizado: ${path.relative(process.cwd(), ENV_FILE)}`);
  console.log(
    'Los idTokens caducan (~1h). Vuelve a ejecutar este script cuando fallen los requests.'
  );
})().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
