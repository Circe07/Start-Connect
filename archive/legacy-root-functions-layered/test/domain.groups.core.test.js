const { createGetPublicGroupsUseCase } = require('../src/domain/groups/getPublicGroupsUseCase');
const { createJoinGroupUseCase } = require('../src/domain/groups/joinGroupUseCase');
const { createSendGroupMessageUseCase } = require('../src/domain/groups/sendGroupMessageUseCase');
const { createGetGroupMessagesUseCase } = require('../src/domain/groups/getGroupMessagesUseCase');

describe('groups core use cases', () => {
  test('getPublicGroups devuelve paginacion', async () => {
    const useCase = createGetPublicGroupsUseCase({
      groupRepository: {
        async listPublicGroups() {
          return { groups: [{ id: 'g1' }], hasMore: false, nextStartAfterId: null };
        },
      },
    });
    const result = await useCase.execute({ limit: 10 });
    expect(result.groups).toHaveLength(1);
  });

  test('joinGroup exige uid', async () => {
    const useCase = createJoinGroupUseCase({ groupRepository: { async joinGroup() {} } });
    await expect(useCase.execute({ groupId: 'g1', uid: '' })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  test('sendGroupMessage exige contenido', async () => {
    const useCase = createSendGroupMessageUseCase({
      groupRepository: { async sendMessage() {} },
    });
    await expect(useCase.execute({ groupId: 'g1', uid: 'u1', content: ' ' })).rejects.toMatchObject(
      {
        status: 400,
        code: 'VALIDATION_ERROR',
      }
    );
  });

  test('getGroupMessages exige uid', async () => {
    const useCase = createGetGroupMessagesUseCase({
      groupRepository: { async getMessages() {} },
    });
    await expect(useCase.execute({ groupId: 'g1', uid: null })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });
});
