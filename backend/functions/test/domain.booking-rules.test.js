const { canTransitionBookingStatus, canCancelBooking } = require('../src/domain/bookingRules');

describe('booking domain rules', () => {
  test('rejects invalid transition from cancelada to confirmada', () => {
    expect(canTransitionBookingStatus('cancelada', 'confirmada')).toBe(false);
  });

  test('allows valid transition from pendiente to confirmada', () => {
    expect(canTransitionBookingStatus('pendiente', 'confirmada')).toBe(true);
  });

  test('allows cancel for owner or admin only', () => {
    expect(canCancelBooking({ bookingUserId: 'u1', currentUserId: 'u1', role: 'user' })).toBe(true);
    expect(canCancelBooking({ bookingUserId: 'u1', currentUserId: 'u2', role: 'user' })).toBe(
      false
    );
    expect(canCancelBooking({ bookingUserId: 'u1', currentUserId: 'admin', role: 'admin' })).toBe(
      true
    );
  });
});
