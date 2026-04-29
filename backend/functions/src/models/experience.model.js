const EXPERIENCE_STATUSES = ['borrador', 'publicada', 'llena', 'completada', 'cancelada'];

class Experience {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.titulo = payload.titulo || '';
    this.descripcion = payload.descripcion || '';
    this.deporte_vertical = payload.deporte_vertical || '';
    this.ciudad = payload.ciudad || '';
    this.club = payload.club || '';
    this.direccion = payload.direccion || '';
    this.fecha = payload.fecha || '';
    this.hora_inicio = payload.hora_inicio || '';
    this.hora_fin = payload.hora_fin || '';
    this.nivel_permitido = payload.nivel_permitido || '';
    this.plazas_totales = Number(payload.plazas_totales || 0);
    this.plazas_disponibles = Number(payload.plazas_disponibles ?? payload.plazas_totales ?? 0);
    this.precio = Number(payload.precio || 0);
    this.host_asignado = payload.host_asignado || null;
    this.estado = payload.estado || 'borrador';
    this.politica_cancelacion = payload.politica_cancelacion || '';
    this.instrucciones = payload.instrucciones || '';
    this.updatedAt = null;
    this.createdAt = null;
  }

  static statuses() {
    return EXPERIENCE_STATUSES;
  }

  static validate(data, { requirePublishFields = false } = {}) {
    const requiredAlways = [
      'titulo',
      'deporte_vertical',
      'ciudad',
      'fecha',
      'hora_inicio',
      'hora_fin',
    ];
    const requiredForPublish = [
      'descripcion',
      'club',
      'direccion',
      'nivel_permitido',
      'plazas_totales',
      'precio',
      'politica_cancelacion',
      'instrucciones',
    ];

    const required = requirePublishFields
      ? requiredAlways.concat(requiredForPublish)
      : requiredAlways;

    for (const field of required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return `Campo requerido: ${field}`;
      }
    }

    if (data.plazas_totales !== undefined && Number(data.plazas_totales) <= 0) {
      return 'plazas_totales debe ser mayor a 0';
    }

    if (data.plazas_disponibles !== undefined && Number(data.plazas_disponibles) < 0) {
      return 'plazas_disponibles no puede ser negativa';
    }

    if (
      data.plazas_totales !== undefined &&
      data.plazas_disponibles !== undefined &&
      Number(data.plazas_disponibles) > Number(data.plazas_totales)
    ) {
      return 'plazas_disponibles no puede ser mayor a plazas_totales';
    }

    if (data.hora_inicio && data.hora_fin && data.hora_inicio >= data.hora_fin) {
      return 'hora_inicio debe ser menor que hora_fin';
    }

    if (data.estado && !EXPERIENCE_STATUSES.includes(data.estado)) {
      return `Estado inválido. Permitidos: ${EXPERIENCE_STATUSES.join(', ')}`;
    }

    return null;
  }

  toFirestore(FieldValue) {
    return {
      titulo: this.titulo,
      descripcion: this.descripcion,
      deporte_vertical: this.deporte_vertical,
      ciudad: this.ciudad,
      club: this.club,
      direccion: this.direccion,
      fecha: this.fecha,
      hora_inicio: this.hora_inicio,
      hora_fin: this.hora_fin,
      nivel_permitido: this.nivel_permitido,
      plazas_totales: this.plazas_totales,
      plazas_disponibles: this.plazas_disponibles,
      precio: this.precio,
      host_asignado: this.host_asignado,
      estado: this.estado,
      politica_cancelacion: this.politica_cancelacion,
      instrucciones: this.instrucciones,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Experience;
