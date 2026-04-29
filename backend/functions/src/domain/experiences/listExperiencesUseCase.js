function createListExperiencesUseCase({ experienceRepository }) {
  return {
    async execute(params) {
      const experiences = await experienceRepository.list(params || {});
      return { experiences };
    },
  };
}

module.exports = { createListExperiencesUseCase };
