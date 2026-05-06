describe('payments controller helpers', () => {
  test('maps successful events to paid', () => {
    const { __testables } = require('../src/controllers/payments.controller');
    expect(__testables.getEventPaymentStatus('checkout.session.completed')).toBe('paid');
    expect(__testables.getEventPaymentStatus('payment_intent.succeeded')).toBe('paid');
  });

  test('maps failed/refunded events', () => {
    const { __testables } = require('../src/controllers/payments.controller');
    expect(__testables.getEventPaymentStatus('payment_intent.payment_failed')).toBe('failed');
    expect(__testables.getEventPaymentStatus('charge.refunded')).toBe('refunded');
  });

  test('ignores unsupported events', () => {
    const { __testables } = require('../src/controllers/payments.controller');
    expect(__testables.getEventPaymentStatus('customer.created')).toBeNull();
  });
});
