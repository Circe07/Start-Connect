const { AppError } = require('../../shared/AppError');

function createGetMyProfileUseCase({ userRepository }) {
  return {
    async execute({ uid }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }

      const user = await userRepository.findById(uid);
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

module.exports = { createGetMyProfileUseCase };
