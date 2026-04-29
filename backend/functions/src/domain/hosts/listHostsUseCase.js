function createListHostsUseCase({ hostRepository }) {
  return {
    async execute() {
      const hosts = await hostRepository.list();
      return { hosts };
    },
  };
}

module.exports = { createListHostsUseCase };
