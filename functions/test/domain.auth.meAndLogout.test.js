const { createGetMeUseCase } = require('../src/domain/auth/getMeUseCase');
const { createLogoutUseCase } = require('../src/domain/auth/logoutUseCase');

describe('auth me/logout use cases', () => {
  test('getMe devuelve perfil basico', async () => {
    const useCase = createGetMeUseCase({
      authGateway: {
        async getUserByUid(uid) {
          expect(uid).toBe('u1');
          return { uid: 'u1', email: 'u@test.com', displayName: 'User One' };
        },
      },
    });

    const result = await useCase.execute({ uid: 'u1' });
    expect(result).toEqual({
      uid: 'u1',
      email: 'u@test.com',
      displayName: 'User One',
    });
  });

  test('logout revoca tokens', async () => {
    let calledWith = null;
    const useCase = createLogoutUseCase({
      authGateway: {
        async revokeRefreshTokens(uid) {
          calledWith = uid;
        },
      },
    });

    const result = await useCase.execute({ uid: 'u9' });
    expect(calledWith).toBe('u9');
    expect(result).toEqual({ message: 'Sesión cerrada correctamente' });
  });
});
