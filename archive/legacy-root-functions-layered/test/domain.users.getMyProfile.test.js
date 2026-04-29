const { createGetMyProfileUseCase } = require('../src/domain/users/getMyProfileUseCase');

describe('getMyProfileUseCase', () => {
  test('falla con 401 sin uid', async () => {
    const useCase = createGetMyProfileUseCase({
      userRepository: { async findById() {} },
    });

    await expect(useCase.execute({ uid: null })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  test('falla con 404 si usuario no existe', async () => {
    const useCase = createGetMyProfileUseCase({
      userRepository: {
        async findById() {
          return null;
        },
      },
    });

    await expect(useCase.execute({ uid: 'u1' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  test('devuelve perfil cuando existe', async () => {
    const useCase = createGetMyProfileUseCase({
      userRepository: {
        async findById(uid) {
          expect(uid).toBe('u1');
          return { uid: 'u1', name: 'Ana', email: 'ana@mail.com' };
        },
      },
    });

    const result = await useCase.execute({ uid: 'u1' });
    expect(result).toEqual({ uid: 'u1', name: 'Ana', email: 'ana@mail.com' });
  });
});
