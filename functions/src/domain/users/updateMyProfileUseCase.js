const { AppError } = require('../../shared/AppError');

const ALLOWED_FIELDS = ['name', 'username', 'bio', 'photo', 'sports', 'phoneNumber', 'location'];

function createUpdateMyProfileUseCase({ userRepository }) {
  return {
    async execute({ uid, body }) {
      if (!uid) {
        throw new AppError({
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
          status: 401,
        });
      }

      const data = {};
      for (const field of ALLOWED_FIELDS) {
        if (body?.[field] !== undefined) data[field] = body[field];
      }
      if (Object.keys(data).length === 0) {
        throw new AppError({
          message: 'No se proporcionaron campos válidos para actualizar',
          code: 'VALIDATION_ERROR',
          status: 400,
        });
      }

      await userRepository.updateById(uid, data);
      return { message: 'Perfil actualizado correctamente' };
    },
  };
}

module.exports = { createUpdateMyProfileUseCase, ALLOWED_FIELDS };
