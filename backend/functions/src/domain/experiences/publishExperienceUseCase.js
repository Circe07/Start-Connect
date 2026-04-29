const Experience = require('../../models/experience.model');

function createPublishExperienceUseCase({ experienceRepository }) {
  return {
    async execute({ id }) {
      const experience = await experienceRepository.getById(id);
      if (!experience) {
        const err = new Error('Experience no encontrada');
        err.status = 404;
        throw err;
      }
      const error = Experience.validate(experience, { requirePublishFields: true });
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      const estado = Number(experience.plazas_disponibles || 0) <= 0 ? 'llena' : 'publicada';
      await experienceRepository.update(id, { estado });
      return { id, estado };
    },
  };
}

module.exports = { createPublishExperienceUseCase };
