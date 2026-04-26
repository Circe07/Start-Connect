#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
loadDotEnv(path.join(rootDir, '.env.smoke'));

const BASE_URL = mustEnv('SMOKE_BASE_URL');
const EMAIL = mustEnv('SMOKE_EMAIL');
const PASSWORD = mustEnv('SMOKE_PASSWORD');
const ENABLE_PROFILE_UPDATE = (process.env.SMOKE_ENABLE_PROFILE_UPDATE || 'false')
  .toLowerCase()
  .trim() === 'true';

const START = Date.now();

const requestId = () =>
  `smoke-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

function logStep(label, details = '') {
  const suffix = details ? ` -> ${details}` : '';
  console.log(`\n[STEP] ${label}${suffix}`);
}

function ok(message) {
  console.log(`[OK] ${message}`);
}

function fail(message, extra = null) {
  console.error(`[FAIL] ${message}`);
  if (extra) {
    console.error(extra);
  }
  process.exit(1);
}

function mustEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    fail(`Missing required env var: ${name}`);
  }
  return value.trim();
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = rawValue;
    }
  }
}

function extractMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload.error === 'string') return payload.error;
  if (typeof payload.error?.message === 'string') return payload.error.message;
  if (typeof payload.message === 'string') return payload.message;
  return fallback;
}

async function callApi(endpoint, { method = 'GET', token, body } = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-request-id': requestId(),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let payload = {};

  if (raw.trim().length > 0) {
    try {
      payload = JSON.parse(raw);
    } catch {
      fail(`Non-JSON response from ${endpoint}`, raw.slice(0, 500));
    }
  }

  return { response, payload, url };
}

async function run() {
  console.log('=== StartAndConnect Frontend Prod Smoke ===');
  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`EMAIL=${EMAIL}`);
  console.log(`PROFILE_UPDATE=${ENABLE_PROFILE_UPDATE}`);

  const login = await callWithFallback({
    label: 'Login',
    candidates: ['/v1/auth/login', '/auth/login'],
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD },
  });

  if (!login.response.ok || login.payload?.success === false) {
    fail(
      `Login failed (${login.response.status})`,
      extractMessage(login.payload, 'Unknown login error'),
    );
  }

  const token = login.payload?.data?.token || login.payload?.token;
  if (!token) {
    fail('Login succeeded but token not found in response', login.payload);
  }
  ok('Login success and token acquired');

  const me = await callWithFallback({
    label: 'Get current user',
    candidates: ['/v1/users/me', '/users/me', '/v1/auth/me', '/auth/me'],
    method: 'GET',
    token,
  });
  const user = me.payload?.data?.user || me.payload?.data || {};
  const userId = user?.id || user?.uid || '(unknown)';
  ok(`Current user loaded (${userId})`);

  const groups = await callWithFallback({
    label: 'Get groups public',
    candidates: ['/v1/groups/public', '/groups/public'],
    method: 'GET',
    token,
  });
  const totalGroups = Array.isArray(groups.payload?.data?.groups)
    ? groups.payload.data.groups.length
    : 0;
  ok(`Groups loaded (${totalGroups})`);

  if (ENABLE_PROFILE_UPDATE) {
    const mePatchEndpoint = me.endpoint.includes('/auth/me')
      ? null
      : me.endpoint;
    if (!mePatchEndpoint) {
      console.log('[SKIP] Profile update skipped (only /auth/me available)');
    } else {
      logStep('Patch profile', mePatchEndpoint);
      const updatedBio = `[smoke] ${new Date().toISOString()}`;
      const patch = await callApi(mePatchEndpoint, {
        method: 'PATCH',
        token,
        body: { bio: updatedBio },
      });

      if (!patch.response.ok || patch.payload?.success === false) {
        fail(
          `Patch profile failed (${patch.response.status})`,
          extractMessage(patch.payload, 'Unknown PATCH /users/me error'),
        );
      }
      ok('Profile update success');
    }
  } else {
    console.log('[SKIP] Profile update disabled');
  }

  await callWithFallback({
    label: 'Logout',
    candidates: ['/v1/auth/logout', '/auth/logout'],
    method: 'POST',
    token,
  });
  ok('Logout success');

  const elapsed = ((Date.now() - START) / 1000).toFixed(2);
  console.log(`\n=== Smoke completed in ${elapsed}s ===`);
}

run().catch(error => fail('Unhandled smoke error', error?.stack || String(error)));

async function callWithFallback({ label, candidates, method, token, body }) {
  let last;
  for (const endpoint of candidates) {
    logStep(label, endpoint);
    const res = await callApi(endpoint, { method, token, body });
    last = { ...res, endpoint };

    if (res.response.status === 404) {
      console.log(`[WARN] ${endpoint} -> 404, trying fallback`);
      continue;
    }

    if (!res.response.ok || res.payload?.success === false) {
      fail(
        `${label} failed (${res.response.status}) on ${endpoint}`,
        extractMessage(res.payload, `Unknown error in ${endpoint}`),
      );
    }

    ok(`${label} success (${endpoint})`);
    return { ...res, endpoint };
  }

  fail(
    `${label} failed: all endpoint candidates returned 404`,
    candidates.join(', '),
  );
  return last;
}
