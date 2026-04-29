const { createGetUserProfileUseCase } = require('../src/domain/users/getUserProfileUseCase');
const { createUpdateMyProfileUseCase } = require('../src/domain/users/updateMyProfileUseCase');

describe('users use cases (get by id / update me)', () => {
  test('getUserProfile falla 401 sin uid autenticado', async () => {
    const useCase = createGetUserProfileUseCase({
      userRepository: { async findById() {} },
    });

    await expect(useCase.execute({ requesterUid: '', targetUid: 'u2' })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  test('getUserProfile devuelve perfil cuando existe', async () => {
    const useCase = createGetUserProfileUseCase({
      userRepository: {
        async findById(uid) {
          expect(uid).toBe('u2');
          return { uid: 'u2', name: 'User2' };
        },
      },
    });

    const result = await useCase.execute({ requesterUid: 'u1', targetUid: 'u2' });
    expect(result).toEqual({ uid: 'u2', name: 'User2' });
  });

  test('updateMyProfile filtra campos permitidos', async () => {
    let payload = null;
    const useCase = createUpdateMyProfileUseCase({
      userRepository: {
        async updateById(uid, data) {
          expect(uid).toBe('u1');
          payload = data;
        },
      },
    });

    const result = await useCase.execute({
      uid: 'u1',
      body: { name: 'Ana', role: 'admin', bio: 'hola' },
    });

    expect(payload).toEqual({ name: 'Ana', bio: 'hola' });
    expect(result).toEqual({ message: 'Perfil actualizado correctamente' });
  });
});
