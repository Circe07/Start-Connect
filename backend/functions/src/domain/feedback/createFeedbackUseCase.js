const Feedback = require('../../models/feedback.model');

function createCreateFeedbackUseCase({ feedbackRepository }) {
  return {
    async execute(input) {
      const payload = {
        user_id: input.user_id,
        experience_id: input.experience_id,
        nota_1_10: input.nota_1_10,
        nota_app: input.nota_app,
        nota_club: input.nota_club,
        nota_host: input.nota_host,
        nota_companeros: input.nota_companeros,
        feedback_version: input.nota_app !== undefined ? 'v2' : undefined,
        repetiria: input.repetiria,
        traeria_amigo: input.traeria_amigo,
        comentario: input.comentario || '',
      };
      const error = Feedback.validate(payload);
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      return feedbackRepository.create(payload);
    },
  };
}

module.exports = { createCreateFeedbackUseCase };
