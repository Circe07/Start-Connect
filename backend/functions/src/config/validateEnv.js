function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;

  const required = ['AUTH_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
