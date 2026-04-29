const ExperienceBooking = require('../../models/experienceBooking.model');

function createCreateExperienceBookingUseCase({ experienceBookingRepository }) {
  return {
    async execute(input) {
      const payload = {
        user_id: input.user_id,
        experience_id: input.experience_id,
        estado: 'pendiente',
        metodo_pago: input.metodo_pago || '',
        importe: input.importe || 0,
        codigo_referido: input.codigo_referido || '',
        viene_con_amigo: Boolean(input.viene_con_amigo),
      };
      const error = ExperienceBooking.validate(payload);
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      return experienceBookingRepository.createWithSeat(payload);
    },
  };
}

module.exports = { createCreateExperienceBookingUseCase };
