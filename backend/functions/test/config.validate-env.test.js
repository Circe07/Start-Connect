describe('validateEnv', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevAuthKey = process.env.AUTH_API_KEY;
  const prevFirebaseKey = process.env.FIREBASE_API_KEY;
  const prevCors = process.env.CORS_ORIGINS;
  const prevKService = process.env.K_SERVICE;
  const prevStripeMode = process.env.STRIPE_MODE;
  const prevStripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  const prevStripeFixed = process.env.STRIPE_CHECKOUT_URL_FIXED;
  const prevStripeKey = process.env.STRIPE_SECRET_KEY;
  const prevStripeSuccess = process.env.STRIPE_SUCCESS_URL;
  const prevStripeCancel = process.env.STRIPE_CANCEL_URL;

  const setBaseProdEnv = () => {
    process.env.NODE_ENV = 'production';
    process.env.K_SERVICE = 'api';
    process.env.AUTH_API_KEY = 'key';
    process.env.CORS_ORIGINS = 'https://a.com';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_MODE = 'fixed';
    process.env.STRIPE_CHECKOUT_URL_FIXED = 'https://book.stripe.com/test';
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SUCCESS_URL;
    delete process.env.STRIPE_CANCEL_URL;
  };

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    process.env.AUTH_API_KEY = prevAuthKey;
    process.env.FIREBASE_API_KEY = prevFirebaseKey;
    process.env.CORS_ORIGINS = prevCors;
    process.env.K_SERVICE = prevKService;
    process.env.STRIPE_MODE = prevStripeMode;
    process.env.STRIPE_WEBHOOK_SECRET = prevStripeWebhook;
    process.env.STRIPE_CHECKOUT_URL_FIXED = prevStripeFixed;
    process.env.STRIPE_SECRET_KEY = prevStripeKey;
    process.env.STRIPE_SUCCESS_URL = prevStripeSuccess;
    process.env.STRIPE_CANCEL_URL = prevStripeCancel;
    jest.resetModules();
  });

  test('throws in production when auth api key is missing', () => {
    setBaseProdEnv();
    delete process.env.AUTH_API_KEY;
    delete process.env.FIREBASE_API_KEY;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });

  test('throws in production when CORS_ORIGINS is missing or empty', () => {
    setBaseProdEnv();
    delete process.env.CORS_ORIGINS;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/CORS_ORIGINS/);
  });

  test('throws in production when CORS_ORIGINS is only commas/spaces', () => {
    setBaseProdEnv();
    process.env.CORS_ORIGINS = ' , , ';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/CORS_ORIGINS/);
  });

  test('does not throw in production when auth api key and CORS exist', () => {
    setBaseProdEnv();
    process.env.CORS_ORIGINS = 'https://a.com,https://b.com';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
  });

  test('throws in production fixed mode when checkout URL is missing', () => {
    setBaseProdEnv();
    delete process.env.STRIPE_CHECKOUT_URL_FIXED;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/STRIPE_CHECKOUT_URL_FIXED/);
  });

  test('throws in production dynamic mode without stripe key and return URLs', () => {
    setBaseProdEnv();
    process.env.STRIPE_MODE = 'dynamic';
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SUCCESS_URL;
    delete process.env.STRIPE_CANCEL_URL;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/STRIPE_SECRET_KEY|STRIPE_SUCCESS_URL|STRIPE_CANCEL_URL/);
  });

  test('does not throw in development without CORS_ORIGINS', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.CORS_ORIGINS;
    process.env.AUTH_API_KEY = 'key';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
  });

  test('does not enforce when production but not on Cloud Run (e.g. firebase deploy analysis)', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.K_SERVICE;
    delete process.env.AUTH_API_KEY;
    delete process.env.FIREBASE_API_KEY;
    delete process.env.CORS_ORIGINS;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
  });
});
