const { AppError } = require('../../shared/AppError');

function createJoinGroupUseCase({ groupRepository }) {
  return {
    async execute({ groupId, uid }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      return groupRepository.joinGroup({ groupId, uid });
    },
  };
}

module.exports = { createJoinGroupUseCase };
