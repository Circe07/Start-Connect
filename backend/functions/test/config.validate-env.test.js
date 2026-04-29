describe('validateEnv', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevAuthKey = process.env.AUTH_API_KEY;
  const prevFirebaseKey = process.env.FIREBASE_API_KEY;

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    process.env.AUTH_API_KEY = prevAuthKey;
    process.env.FIREBASE_API_KEY = prevFirebaseKey;
    jest.resetModules();
  });

  test('throws in production when auth api key is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_API_KEY;
    delete process.env.FIREBASE_API_KEY;
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });

  test('does not throw in production when auth api key exists', () => {
    process.env.NODE_ENV = 'production';
    process.env.AUTH_API_KEY = 'key';
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
  });
});
