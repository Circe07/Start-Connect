const { AppError } = require('../../shared/AppError');

function createSendGroupMessageUseCase({ groupRepository }) {
  return {
    async execute({ groupId, uid, content }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      if (!content || !String(content).trim()) {
        throw new AppError({
          message: 'El contenido es obligatorio',
          code: 'VALIDATION_ERROR',
          status: 400,
        });
      }
      return groupRepository.sendMessage({ groupId, uid, content });
    },
  };
}

module.exports = { createSendGroupMessageUseCase };
