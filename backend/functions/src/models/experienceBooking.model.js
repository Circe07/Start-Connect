const BOOKING_STATUSES = ['pendiente', 'confirmada', 'pagada', 'cancelada', 'asistio', 'no_show'];

class ExperienceBooking {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.user_id = payload.user_id;
    this.experience_id = payload.experience_id;
    this.estado = payload.estado || 'pendiente';
    this.metodo_pago = payload.metodo_pago || '';
    this.importe = Number(payload.importe || 0);
    this.fecha_reserva = payload.fecha_reserva || null;
    this.codigo_referido = payload.codigo_referido || '';
    this.viene_con_amigo = Boolean(payload.viene_con_amigo);
    this.updatedAt = null;
    this.createdAt = null;
  }

  static statuses() {
    return BOOKING_STATUSES;
  }

  static validate(data) {
    const required = ['user_id', 'experience_id'];
    for (const field of required) {
      if (!data[field]) return `Campo requerido: ${field}`;
    }

    if (data.estado && !BOOKING_STATUSES.includes(data.estado)) {
      return `Estado inválido. Permitidos: ${BOOKING_STATUSES.join(', ')}`;
    }

    if (data.importe !== undefined && Number(data.importe) < 0) {
      return 'importe no puede ser negativo';
    }

    return null;
  }

  toFirestore(FieldValue) {
    return {
      user_id: this.user_id,
      experience_id: this.experience_id,
      estado: this.estado,
      metodo_pago: this.metodo_pago,
      importe: this.importe,
      fecha_reserva: this.fecha_reserva || FieldValue.serverTimestamp(),
      codigo_referido: this.codigo_referido,
      viene_con_amigo: this.viene_con_amigo,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = ExperienceBooking;
