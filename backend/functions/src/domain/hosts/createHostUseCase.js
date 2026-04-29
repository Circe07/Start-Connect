const Host = require('../../models/host.model');

function createCreateHostUseCase({ hostRepository }) {
  return {
    async execute(payload) {
      const error = Host.validate(payload || {});
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      const host = new Host(payload);
      return hostRepository.create({
        nombre: host.nombre,
        telefono: host.telefono,
        nivel_aproximado: host.nivel_aproximado,
        disponibilidad: host.disponibilidad,
        estado: host.estado,
        partidas_realizadas: host.partidas_realizadas,
        nps_medio: host.nps_medio,
        observaciones: host.observaciones,
      });
    },
  };
}

module.exports = { createCreateHostUseCase };
