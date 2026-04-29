const { createCreateFeedbackUseCase } = require('../src/domain/feedback/createFeedbackUseCase');

describe('createFeedbackUseCase', () => {
  test('fails if note is outside 1..10 (RED)', async () => {
    const repo = { create: jest.fn() };
    const useCase = createCreateFeedbackUseCase({ feedbackRepository: repo });
    await expect(
      useCase.execute({
        user_id: 'u1',
        experience_id: 'exp1',
        nota_1_10: 15,
      })
    ).rejects.toThrow('nota_1_10');
  });

  test('creates feedback with valid payload (GREEN)', async () => {
    const repo = {
      create: jest.fn(async (p) => ({ id: 'fb-1', ...p })),
    };
    const useCase = createCreateFeedbackUseCase({ feedbackRepository: repo });
    const result = await useCase.execute({
      user_id: 'u1',
      experience_id: 'exp1',
      nota_1_10: 9,
      repetiria: true,
      traeria_amigo: true,
      comentario: 'Muy bien',
    });
    expect(result.id).toBe('fb-1');
    expect(repo.create).toHaveBeenCalled();
  });
});
