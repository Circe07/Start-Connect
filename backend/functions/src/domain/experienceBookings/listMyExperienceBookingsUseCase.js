function createListMyExperienceBookingsUseCase({ experienceBookingRepository }) {
  return {
    async execute({ user_id }) {
      const bookings = await experienceBookingRepository.listByUser(user_id);
      return { bookings };
    },
  };
}

module.exports = { createListMyExperienceBookingsUseCase };
