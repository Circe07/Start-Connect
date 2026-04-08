const { AppError } = require('../../shared/AppError');

function createGetMeUseCase({ authGateway }) {
  return {
    async execute({ uid }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }

      const user = await authGateway.getUserByUid(uid);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    },
  };
}

module.exports = { createGetMeUseCase };
