const Host = require('../../models/host.model');

function createUpdateHostUseCase({ hostRepository }) {
  const allowed = [
    'nombre',
    'telefono',
    'nivel_aproximado',
    'disponibilidad',
    'estado',
    'partidas_realizadas',
    'nps_medio',
    'observaciones',
  ];
  return {
    async execute({ id, patch }) {
      const filtered = {};
      for (const key of allowed) if (patch[key] !== undefined) filtered[key] = patch[key];
      if (!Object.keys(filtered).length) {
        const err = new Error('No se proporcionaron campos válidos para actualizar');
        err.status = 400;
        throw err;
      }
      const error = Host.validate({ ...filtered, nombre: filtered.nombre || 'ok' });
      if (error && !error.includes('nombre')) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      return hostRepository.update(id, filtered);
    },
  };
}

module.exports = { createUpdateHostUseCase };
