const Experience = require('../../models/experience.model');

function createUpdateExperienceUseCase({ experienceRepository }) {
  const allowedFields = [
    'titulo',
    'descripcion',
    'deporte_vertical',
    'ciudad',
    'club',
    'direccion',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'nivel_permitido',
    'plazas_totales',
    'plazas_disponibles',
    'precio',
    'host_asignado',
    'estado',
    'politica_cancelacion',
    'instrucciones',
  ];

  return {
    async execute({ id, patch }) {
      const filtered = {};
      for (const key of allowedFields) {
        if (patch[key] !== undefined) filtered[key] = patch[key];
      }
      if (!Object.keys(filtered).length) {
        const err = new Error('No se proporcionaron campos válidos para actualizar');
        err.status = 400;
        throw err;
      }
      const error = Experience.validate(filtered);
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      await experienceRepository.update(id, filtered);
      return { id, ...filtered };
    },
  };
}

module.exports = { createUpdateExperienceUseCase };
