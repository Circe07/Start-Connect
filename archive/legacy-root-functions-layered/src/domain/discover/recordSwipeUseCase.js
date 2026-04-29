const { AppError } = require('../../shared/AppError');

function createRecordSwipeUseCase({ discoverRepository }) {
  return {
    async execute({ uid, activityId, direction }) {
      if (!uid) {
        throw new AppError({ message: 'No autorizado', code: 'UNAUTHORIZED', status: 401 });
      }
      return discoverRepository.recordSwipe({ uid, activityId, direction });
    },
  };
}

module.exports = { createRecordSwipeUseCase };
