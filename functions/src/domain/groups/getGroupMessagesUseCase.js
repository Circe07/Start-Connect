const { AppError } = require('../../shared/AppError');

function createGetGroupMessagesUseCase({ groupRepository }) {
  return {
    async execute({ groupId, uid, limit, startAfterId }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      return groupRepository.getMessages({ groupId, uid, limit, startAfterId });
    },
  };
}

module.exports = { createGetGroupMessagesUseCase };
