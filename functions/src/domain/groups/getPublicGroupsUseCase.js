function createGetPublicGroupsUseCase({ groupRepository }) {
  return {
    async execute({ limit, startAfterId }) {
      return groupRepository.listPublicGroups({ limit, startAfterId });
    },
  };
}

module.exports = { createGetPublicGroupsUseCase };
