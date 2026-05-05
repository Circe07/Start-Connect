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

  test('creates feedback with v2 granular payload', async () => {
    const repo = {
      create: jest.fn(async (p) => ({ id: 'fb-2', ...p })),
    };
    const useCase = createCreateFeedbackUseCase({ feedbackRepository: repo });
    const result = await useCase.execute({
      user_id: 'u1',
      experience_id: 'exp1',
      nota_app: 9,
      nota_club: 8,
      nota_host: 10,
      nota_companeros: 7,
      repetiria: true,
      traeria_amigo: true,
    });
    expect(result.id).toBe('fb-2');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        feedback_version: 'v2',
        nota_app: 9,
        nota_club: 8,
        nota_host: 10,
        nota_companeros: 7,
      })
    );
  });

  test('fails if v2 payload has missing rating', async () => {
    const repo = { create: jest.fn() };
    const useCase = createCreateFeedbackUseCase({ feedbackRepository: repo });
    await expect(
      useCase.execute({
        user_id: 'u1',
        experience_id: 'exp1',
        nota_app: 9,
        nota_club: 8,
        nota_host: 10,
      })
    ).rejects.toThrow('nota_companeros');
  });
});
