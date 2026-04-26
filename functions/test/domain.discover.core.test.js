const { createListActivitiesUseCase } = require('../src/domain/discover/listActivitiesUseCase');
const { createRecordSwipeUseCase } = require('../src/domain/discover/recordSwipeUseCase');
const { createListMatchesUseCase } = require('../src/domain/discover/listMatchesUseCase');

describe('discover use cases', () => {
  test('listActivities delega en repositorio', async () => {
    const useCase = createListActivitiesUseCase({
      discoverRepository: {
        async listActivities() {
          return { activities: [] };
        },
      },
    });
    const result = await useCase.execute({ city: 'Madrid' });
    expect(result.activities).toEqual([]);
  });

  test('recordSwipe exige uid', async () => {
    const useCase = createRecordSwipeUseCase({
      discoverRepository: { async recordSwipe() {} },
    });
    await expect(
      useCase.execute({ uid: null, activityId: 'a1', direction: 'like' })
    ).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
  });

  test('listMatches exige uid', async () => {
    const useCase = createListMatchesUseCase({
      discoverRepository: { async listMatches() {} },
    });
    await expect(useCase.execute({ uid: '', limit: 10 })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
