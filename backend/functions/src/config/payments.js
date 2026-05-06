function getStripeMode() {
  return process.env.STRIPE_MODE === 'dynamic' ? 'dynamic' : 'fixed';
}

function getFixedCheckoutUrl() {
  return (process.env.STRIPE_CHECKOUT_URL_FIXED || '').trim();
}

function getStripeSuccessUrl() {
  return (process.env.STRIPE_SUCCESS_URL || '').trim();
}

function getStripeCancelUrl() {
  return (process.env.STRIPE_CANCEL_URL || '').trim();
}

function createStripeClient() {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  const Stripe = require('stripe');
  return new Stripe(secretKey);
}

module.exports = {
  getStripeMode,
  getFixedCheckoutUrl,
  getStripeSuccessUrl,
  getStripeCancelUrl,
  createStripeClient,
};
