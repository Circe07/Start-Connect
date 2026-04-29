const ExperienceBooking = require('../../models/experienceBooking.model');

const ALLOWED_TRANSITIONS = {
  pendiente: ['confirmada', 'pagada', 'cancelada'],
  confirmada: ['pagada', 'cancelada', 'asistio', 'no_show'],
  pagada: ['cancelada', 'asistio', 'no_show'],
  cancelada: [],
  asistio: [],
  no_show: [],
};

function createUpdateExperienceBookingStatusUseCase({
  experienceBookingRepository,
  experienceRepository,
}) {
  return {
    async execute({ id, estado }) {
      if (!ExperienceBooking.statuses().includes(estado)) {
        const err = new Error('Estado inválido');
        err.status = 400;
        throw err;
      }
      const booking = await experienceBookingRepository.getById(id);
      if (!booking) {
        const err = new Error('Reserva no encontrada');
        err.status = 404;
        throw err;
      }
      const allowed = ALLOWED_TRANSITIONS[booking.estado] || [];
      if (!allowed.includes(estado)) {
        const err = new Error(`Transición inválida: ${booking.estado} -> ${estado}`);
        err.status = 400;
        throw err;
      }
      if (estado === 'asistio' || estado === 'no_show') {
        const experience = await experienceRepository.getById(booking.experience_id);
        if (!experience) {
          const err = new Error('Experience no encontrada');
          err.status = 404;
          throw err;
        }
        const isCompleted = experience.estado === 'completada';
        const startsAt = Date.parse(`${experience.fecha}T${experience.hora_inicio || '00:00'}:00`);
        if (!isCompleted && (!Number.isFinite(startsAt) || startsAt > Date.now())) {
          const err = new Error(
            'Solo se puede marcar asistencia/no_show cuando la experience inició o está completada'
          );
          err.status = 400;
          throw err;
        }
      }
      return experienceBookingRepository.updateStatus(id, estado);
    },
  };
}

module.exports = { createUpdateExperienceBookingStatusUseCase };
