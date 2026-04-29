const {
  createCreateExperienceUseCase,
} = require('../src/domain/experiences/createExperienceUseCase');

describe('createExperienceUseCase', () => {
  test('fails when required fields are missing (RED)', async () => {
    const repo = { create: jest.fn() };
    const useCase = createCreateExperienceUseCase({ experienceRepository: repo });
    await expect(useCase.execute({})).rejects.toThrow('Campo requerido');
    expect(repo.create).not.toHaveBeenCalled();
  });

  test('creates draft experience when payload is valid (GREEN)', async () => {
    const repo = {
      create: jest.fn(async (p) => ({ id: 'exp-1', ...p })),
    };
    const useCase = createCreateExperienceUseCase({ experienceRepository: repo });
    const result = await useCase.execute({
      titulo: 'Partido',
      deporte_vertical: 'padel',
      ciudad: 'Madrid',
      fecha: '2026-05-01',
      hora_inicio: '10:00',
      hora_fin: '11:00',
      plazas_totales: 8,
    });
    expect(result.id).toBe('exp-1');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ estado: 'borrador' }));
  });
});
