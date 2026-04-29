const ALLOWED_TRANSITIONS = {
  pendiente: ['confirmada', 'pagada', 'cancelada'],
  confirmada: ['pagada', 'cancelada', 'asistio', 'no_show'],
  pagada: ['cancelada', 'asistio', 'no_show'],
  cancelada: [],
  asistio: [],
  no_show: [],
};

function canTransitionBookingStatus(fromStatus, toStatus) {
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function canCancelBooking({ bookingUserId, currentUserId, role }) {
  if (role === 'admin') return true;
  if (!currentUserId) return false;
  return bookingUserId === currentUserId;
}

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransitionBookingStatus,
  canCancelBooking,
};
