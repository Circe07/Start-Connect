class Feedback {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.user_id = payload.user_id;
    this.experience_id = payload.experience_id;
    this.nota_1_10 = Number(payload.nota_1_10);
    this.repetiria = Boolean(payload.repetiria);
    this.traeria_amigo = Boolean(payload.traeria_amigo);
    this.comentario = payload.comentario || '';
    this.fecha = payload.fecha || null;
    this.createdAt = null;
  }

  static validate(data) {
    const required = ['user_id', 'experience_id', 'nota_1_10'];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return `Campo requerido: ${field}`;
      }
    }
    if (
      !Number.isInteger(Number(data.nota_1_10)) ||
      Number(data.nota_1_10) < 1 ||
      Number(data.nota_1_10) > 10
    ) {
      return 'nota_1_10 debe ser un número entero entre 1 y 10';
    }
    return null;
  }

  toFirestore(FieldValue) {
    return {
      user_id: this.user_id,
      experience_id: this.experience_id,
      nota_1_10: this.nota_1_10,
      repetiria: this.repetiria,
      traeria_amigo: this.traeria_amigo,
      comentario: this.comentario,
      fecha: this.fecha || FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Feedback;
