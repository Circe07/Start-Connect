const Referral = require('../../models/referral.model');

function createCreateReferralUseCase({ referralRepository }) {
  return {
    async execute(payload) {
      const error = Referral.validate(payload || {});
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      const referral = new Referral(payload);
      return referralRepository.create({
        user_id: referral.user_id,
        codigo: referral.codigo,
        referido_id: referral.referido_id,
        estado: referral.estado,
        descuento_aplicado: referral.descuento_aplicado,
      });
    },
  };
}

module.exports = { createCreateReferralUseCase };
