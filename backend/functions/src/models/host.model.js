const HOST_STATUSES = ['candidato', 'junior', 'oficial', 'lead'];

class Host {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.nombre = payload.nombre || '';
    this.telefono = payload.telefono || '';
    this.nivel_aproximado = payload.nivel_aproximado || '';
    this.disponibilidad = payload.disponibilidad || '';
    this.estado = payload.estado || 'candidato';
    this.partidas_realizadas = Number(payload.partidas_realizadas || 0);
    this.nps_medio = Number(payload.nps_medio || 0);
    this.observaciones = payload.observaciones || '';
    this.createdAt = null;
    this.updatedAt = null;
  }

  static validate(data) {
    if (!data.nombre) return 'Campo requerido: nombre';
    if (data.estado && !HOST_STATUSES.includes(data.estado)) {
      return `Estado inválido. Permitidos: ${HOST_STATUSES.join(', ')}`;
    }
    return null;
  }

  toFirestore(FieldValue) {
    return {
      nombre: this.nombre,
      telefono: this.telefono,
      nivel_aproximado: this.nivel_aproximado,
      disponibilidad: this.disponibilidad,
      estado: this.estado,
      partidas_realizadas: this.partidas_realizadas,
      nps_medio: this.nps_medio,
      observaciones: this.observaciones,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Host;
