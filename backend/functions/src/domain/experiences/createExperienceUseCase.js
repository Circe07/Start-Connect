const Experience = require('../../models/experience.model');

function createCreateExperienceUseCase({ experienceRepository }) {
  return {
    async execute(input) {
      const payload = { ...input, estado: 'borrador' };
      const error = Experience.validate(payload);
      if (error) {
        const err = new Error(error);
        err.status = 400;
        throw err;
      }
      const normalized = new Experience(payload);
      return experienceRepository.create({
        titulo: normalized.titulo,
        descripcion: normalized.descripcion,
        deporte_vertical: normalized.deporte_vertical,
        ciudad: normalized.ciudad,
        club: normalized.club,
        direccion: normalized.direccion,
        fecha: normalized.fecha,
        hora_inicio: normalized.hora_inicio,
        hora_fin: normalized.hora_fin,
        nivel_permitido: normalized.nivel_permitido,
        plazas_totales: normalized.plazas_totales,
        plazas_disponibles: normalized.plazas_disponibles,
        precio: normalized.precio,
        host_asignado: normalized.host_asignado,
        estado: normalized.estado,
        politica_cancelacion: normalized.politica_cancelacion,
        instrucciones: normalized.instrucciones,
      });
    },
  };
}

module.exports = { createCreateExperienceUseCase };
