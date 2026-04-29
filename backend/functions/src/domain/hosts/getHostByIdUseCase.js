function createGetHostByIdUseCase({ hostRepository }) {
  return {
    async execute({ id }) {
      const host = await hostRepository.getById(id);
      if (!host) {
        const err = new Error('Host no encontrado');
        err.status = 404;
        throw err;
      }
      return { host };
    },
  };
}

module.exports = { createGetHostByIdUseCase };
