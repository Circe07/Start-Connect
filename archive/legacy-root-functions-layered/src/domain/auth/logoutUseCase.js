const { AppError } = require('../../shared/AppError');

function createLogoutUseCase({ authGateway }) {
  return {
    async execute({ uid }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }

      await authGateway.revokeRefreshTokens(uid);
      return { message: 'Sesión cerrada correctamente' };
    },
  };
}

module.exports = { createLogoutUseCase };
