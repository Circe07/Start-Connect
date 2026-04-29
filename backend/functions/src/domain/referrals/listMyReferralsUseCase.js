function createListMyReferralsUseCase({ referralRepository }) {
  return {
    async execute({ user_id }) {
      const referrals = await referralRepository.listByUser(user_id);
      return { referrals };
    },
  };
}

module.exports = { createListMyReferralsUseCase };
