const { AppError } = require('../../shared/AppError');

function createListMatchesUseCase({ discoverRepository }) {
  return {
    async execute({ uid, limit, startAfterId }) {
      if (!uid) {
        throw new AppError({ message: 'No autorizado', code: 'UNAUTHORIZED', status: 401 });
      }
      return discoverRepository.listMatches({ uid, limit, startAfterId });
    },
  };
}

module.exports = { createListMatchesUseCase };
