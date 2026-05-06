describe('payments config', () => {
  const prevMode = process.env.STRIPE_MODE;
  const prevFixed = process.env.STRIPE_CHECKOUT_URL_FIXED;

  afterEach(() => {
    process.env.STRIPE_MODE = prevMode;
    process.env.STRIPE_CHECKOUT_URL_FIXED = prevFixed;
    jest.resetModules();
  });

  test('defaults to fixed mode when STRIPE_MODE is not dynamic', () => {
    process.env.STRIPE_MODE = 'something_else';
    const { getStripeMode } = require('../src/config/payments');
    expect(getStripeMode()).toBe('fixed');
  });

  test('returns dynamic mode when configured', () => {
    process.env.STRIPE_MODE = 'dynamic';
    const { getStripeMode } = require('../src/config/payments');
    expect(getStripeMode()).toBe('dynamic');
  });

  test('reads fixed checkout URL trimmed', () => {
    process.env.STRIPE_CHECKOUT_URL_FIXED = '  https://book.stripe.com/test  ';
    const { getFixedCheckoutUrl } = require('../src/config/payments');
    expect(getFixedCheckoutUrl()).toBe('https://book.stripe.com/test');
  });
});
