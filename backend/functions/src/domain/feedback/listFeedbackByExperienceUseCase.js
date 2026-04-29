function createListFeedbackByExperienceUseCase({ feedbackRepository }) {
  return {
    async execute({ experience_id }) {
      const feedback = await feedbackRepository.listByExperience(experience_id);
      return { feedback };
    },
  };
}

module.exports = { createListFeedbackByExperienceUseCase };
