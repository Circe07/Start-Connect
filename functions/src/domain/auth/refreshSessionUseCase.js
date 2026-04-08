const { AppError } = require('../../shared/AppError');

function createRefreshSessionUseCase({ tokenGateway }) {
  return {
    async execute({ refreshToken }) {
      if (!refreshToken || typeof refreshToken !== 'string') {
        throw new AppError({
          message: 'refreshToken es requerido',
          code: 'VALIDATION_ERROR',
          status: 400,
        });
      }

      const session = await tokenGateway.refresh(refreshToken);
      return {
        token: session.idToken,
        refreshToken: session.refreshToken,
        uid: session.uid,
      };
    },
  };
}

module.exports = { createRefreshSessionUseCase };
