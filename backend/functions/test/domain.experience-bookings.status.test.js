const {
  createUpdateExperienceBookingStatusUseCase,
} = require('../src/domain/experienceBookings/updateExperienceBookingStatusUseCase');

describe('updateExperienceBookingStatusUseCase', () => {
  test('blocks invalid transition (RED)', async () => {
    const bookingRepo = {
      getById: jest.fn(async () => ({ id: 'bk1', estado: 'cancelada', experience_id: 'exp1' })),
      updateStatus: jest.fn(),
    };
    const expRepo = { getById: jest.fn() };
    const useCase = createUpdateExperienceBookingStatusUseCase({
      experienceBookingRepository: bookingRepo,
      experienceRepository: expRepo,
    });
    await expect(useCase.execute({ id: 'bk1', estado: 'confirmada' })).rejects.toThrow(
      'Transición inválida'
    );
  });

  test('allows valid transition and updates status (GREEN)', async () => {
    const bookingRepo = {
      getById: jest.fn(async () => ({ id: 'bk1', estado: 'pendiente', experience_id: 'exp1' })),
      updateStatus: jest.fn(async () => ({ id: 'bk1', estado: 'confirmada' })),
    };
    const expRepo = { getById: jest.fn() };
    const useCase = createUpdateExperienceBookingStatusUseCase({
      experienceBookingRepository: bookingRepo,
      experienceRepository: expRepo,
    });
    const result = await useCase.execute({ id: 'bk1', estado: 'confirmada' });
    expect(result.estado).toBe('confirmada');
    expect(bookingRepo.updateStatus).toHaveBeenCalledWith('bk1', 'confirmada');
  });
});
