const { createRefreshSessionUseCase } = require('../src/domain/auth/refreshSessionUseCase');

describe('refreshSessionUseCase', () => {
  test('falla con 400 si no hay refreshToken', async () => {
    const gateway = {
      async refresh() {
        return { idToken: 'x', refreshToken: 'y', uid: 'u1' };
      },
    };
    const useCase = createRefreshSessionUseCase({ tokenGateway: gateway });

    await expect(useCase.execute({ refreshToken: '' })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('devuelve sesion refrescada cuando gateway responde', async () => {
    const gateway = {
      async refresh(refreshToken) {
        expect(refreshToken).toBe('r1');
        return { idToken: 't2', refreshToken: 'r2', uid: 'u1' };
      },
    };
    const useCase = createRefreshSessionUseCase({ tokenGateway: gateway });

    const result = await useCase.execute({ refreshToken: 'r1' });

    expect(result).toEqual({
      token: 't2',
      refreshToken: 'r2',
      uid: 'u1',
    });
  });
});
