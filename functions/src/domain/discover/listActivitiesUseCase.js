function createListActivitiesUseCase({ discoverRepository }) {
  return {
    async execute(params) {
      return discoverRepository.listActivities(params);
    },
  };
}

module.exports = { createListActivitiesUseCase };
