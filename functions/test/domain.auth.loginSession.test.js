const { createLoginSessionUseCase } = require('../src/domain/auth/loginSessionUseCase');

describe('loginSessionUseCase', () => {
  test('falla con 400 si faltan credenciales', async () => {
    const useCase = createLoginSessionUseCase({
      tokenGateway: { async login() {} },
    });

    await expect(useCase.execute({ email: '', password: '' })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  });

  test('devuelve sesion si login es valido', async () => {
    const useCase = createLoginSessionUseCase({
      tokenGateway: {
        async login({ email, password }) {
          expect(email).toBe('u@test.com');
          expect(password).toBe('Pwd12345!');
          return { idToken: 't1', refreshToken: 'r1', uid: 'u1' };
        },
      },
    });

    const result = await useCase.execute({
      email: 'u@test.com',
      password: 'Pwd12345!',
    });

    expect(result).toEqual({ token: 't1', refreshToken: 'r1', uid: 'u1' });
  });
});
