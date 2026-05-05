describe('validateEnv', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevAuthKey = process.env.AUTH_API_KEY;
  const prevFirebaseKey = process.env.FIREBASE_API_KEY;
  const prevCors = process.env.CORS_ORIGINS;
  const prevKService = process.env.K_SERVICE;

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    process.env.AUTH_API_KEY = prevAuthKey;
    process.env.FIREBASE_API_KEY = prevFirebaseKey;
    process.env.CORS_ORIGINS = prevCors;
    process.env.K_SERVICE = prevKService;
    jest.resetModules();
  });

  test('throws in production when auth api key is missing', () => {
    process.env.NODE_ENV = 'production';
    process.env.K_SERVICE = 'api';
    delete process.env.AUTH_API_KEY;
    delete process.env.FIREBASE_API_KEY;
    process.env.CORS_ORIGINS = 'https://app.example.com';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });

  test('throws in production when CORS_ORIGINS is missing or empty', () => {
    process.env.NODE_ENV = 'production';
    process.env.K_SERVICE = 'api';
    process.env.AUTH_API_KEY = 'key';
    delete process.env.CORS_ORIGINS;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/CORS_ORIGINS/);
  });

  test('throws in production when CORS_ORIGINS is only commas/spaces', () => {
    process.env.NODE_ENV = 'production';
    process.env.K_SERVICE = 'api';
    process.env.AUTH_API_KEY = 'key';
    process.env.CORS_ORIGINS = ' , , ';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow(/CORS_ORIGINS/);
  });

  test('does not throw in production when auth api key and CORS exist', () => {
    process.env.NODE_ENV = 'production';
    process.env.K_SERVICE = 'api';
    process.env.AUTH_API_KEY = 'key';
    process.env.CORS_ORIGINS = 'https://a.com,https://b.com';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
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
