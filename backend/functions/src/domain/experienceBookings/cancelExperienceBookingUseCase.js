function createCancelExperienceBookingUseCase({ experienceBookingRepository }) {
  return {
    async execute({ id }) {
      return experienceBookingRepository.cancelAndReleaseSeat(id);
    },
  };
}

module.exports = { createCancelExperienceBookingUseCase };
