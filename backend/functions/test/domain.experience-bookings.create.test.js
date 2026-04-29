const {
  createCreateExperienceBookingUseCase,
} = require('../src/domain/experienceBookings/createExperienceBookingUseCase');

describe('createExperienceBookingUseCase', () => {
  test('fails without experience_id (RED)', async () => {
    const repo = { createWithSeat: jest.fn() };
    const useCase = createCreateExperienceBookingUseCase({ experienceBookingRepository: repo });
    await expect(useCase.execute({ user_id: 'u1' })).rejects.toThrow(
      'Campo requerido: experience_id'
    );
    expect(repo.createWithSeat).not.toHaveBeenCalled();
  });

  test('creates pending booking with normalized payload (GREEN)', async () => {
    const repo = {
      createWithSeat: jest.fn(async (p) => ({ id: 'bk-1', ...p })),
    };
    const useCase = createCreateExperienceBookingUseCase({ experienceBookingRepository: repo });
    const result = await useCase.execute({
      user_id: 'u1',
      experience_id: 'exp-1',
      importe: 20,
      viene_con_amigo: 1,
    });
    expect(result.id).toBe('bk-1');
    expect(repo.createWithSeat).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'pendiente', viene_con_amigo: true })
    );
  });
});
