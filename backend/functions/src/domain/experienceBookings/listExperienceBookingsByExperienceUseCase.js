function createListExperienceBookingsByExperienceUseCase({ experienceBookingRepository }) {
  return {
    async execute({ experience_id }) {
      const bookings = await experienceBookingRepository.listByExperience(experience_id);
      return { bookings };
    },
  };
}

module.exports = { createListExperienceBookingsByExperienceUseCase };
