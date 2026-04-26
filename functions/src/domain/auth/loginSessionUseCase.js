const { AppError } = require('../../shared/AppError');

function createLoginSessionUseCase({ tokenGateway }) {
  return {
    async execute({ email, password }) {
      if (!email || !password) {
        throw new AppError({
          message: 'Email y contraseña requeridos',
          code: 'VALIDATION_ERROR',
          status: 400,
        });
      }

      const session = await tokenGateway.login({ email, password });
      return {
        token: session.idToken,
        refreshToken: session.refreshToken,
        uid: session.uid,
      };
    },
  };
}

module.exports = { createLoginSessionUseCase };
