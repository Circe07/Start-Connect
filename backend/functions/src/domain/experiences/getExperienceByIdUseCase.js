function createGetExperienceByIdUseCase({ experienceRepository }) {
  return {
    async execute({ id }) {
      const experience = await experienceRepository.getById(id);
      if (!experience) {
        const err = new Error('Experience no encontrada');
        err.status = 404;
        throw err;
      }
      return { experience };
    },
  };
}

module.exports = { createGetExperienceByIdUseCase };
