function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;

  const hasAuthApiKey = Boolean(process.env.AUTH_API_KEY || process.env.FIREBASE_API_KEY);
  const missing = hasAuthApiKey ? [] : ['AUTH_API_KEY_OR_FIREBASE_API_KEY'];
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
