const REFERRAL_STATUSES = ['pendiente', 'aplicado', 'cancelado'];

class Referral {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.user_id = payload.user_id;
    this.codigo = payload.codigo || '';
    this.referido_id = payload.referido_id || '';
    this.estado = payload.estado || 'pendiente';
    this.descuento_aplicado = Boolean(payload.descuento_aplicado);
    this.createdAt = null;
    this.updatedAt = null;
  }

  static validate(data) {
    if (!data.user_id) return 'Campo requerido: user_id';
    if (!data.codigo) return 'Campo requerido: codigo';
    if (data.estado && !REFERRAL_STATUSES.includes(data.estado)) {
      return `Estado inválido. Permitidos: ${REFERRAL_STATUSES.join(', ')}`;
    }
    return null;
  }

  toFirestore(FieldValue) {
    return {
      user_id: this.user_id,
      codigo: this.codigo,
      referido_id: this.referido_id,
      estado: this.estado,
      descuento_aplicado: this.descuento_aplicado,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Referral;
