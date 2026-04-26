const { AppError } = require('../../shared/AppError');

function createGetUserProfileUseCase({ userRepository }) {
  return {
    async execute({ requesterUid, targetUid }) {
      if (!requesterUid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }
      const user = await userRepository.findById(targetUid);
      if (!user) {
        throw new AppError({
          message: 'El usuario no existe',
          code: 'NOT_FOUND',
          status: 404,
        });
      }
      return user;
    },
  };
}

module.exports = { createGetUserProfileUseCase };
