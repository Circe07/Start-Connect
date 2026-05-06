function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;

  // `firebase deploy` loads this module to analyze the codebase before Cloud Run exists.
  // Secret-backed env (e.g. AUTH_API_KEY from defineSecret) is not present then, which
  // would falsely trip validation. Cloud Run always sets K_SERVICE for the service process.
  if (!process.env.K_SERVICE) return;

  const missing = [];

  const hasAuthApiKey = Boolean(process.env.AUTH_API_KEY || process.env.FIREBASE_API_KEY);
  if (!hasAuthApiKey) {
    missing.push('AUTH_API_KEY_OR_FIREBASE_API_KEY');
  }

  const corsRaw = process.env.CORS_ORIGINS;
  const corsOk = typeof corsRaw === 'string' && corsRaw.split(',').some((s) => s.trim().length > 0);
  if (!corsOk) {
    missing.push('CORS_ORIGINS');
  }

  const stripeMode = process.env.STRIPE_MODE === 'dynamic' ? 'dynamic' : 'fixed';
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) {
    missing.push('STRIPE_WEBHOOK_SECRET');
  }
  if (stripeMode === 'fixed') {
    const fixedUrl = (process.env.STRIPE_CHECKOUT_URL_FIXED || '').trim();
    if (!fixedUrl) missing.push('STRIPE_CHECKOUT_URL_FIXED');
  }
  if (stripeMode === 'dynamic') {
    const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    const successUrl = (process.env.STRIPE_SUCCESS_URL || '').trim();
    const cancelUrl = (process.env.STRIPE_CANCEL_URL || '').trim();
    if (!stripeKey) missing.push('STRIPE_SECRET_KEY');
    if (!successUrl) missing.push('STRIPE_SUCCESS_URL');
    if (!cancelUrl) missing.push('STRIPE_CANCEL_URL');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
