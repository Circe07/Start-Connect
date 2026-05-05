class Feedback {
  constructor(payload = {}) {
    this.id = payload.id || null;
    this.user_id = payload.user_id;
    this.experience_id = payload.experience_id;
    this.nota_1_10 = payload.nota_1_10 !== undefined ? Number(payload.nota_1_10) : undefined;
    this.nota_app = payload.nota_app !== undefined ? Number(payload.nota_app) : undefined;
    this.nota_club = payload.nota_club !== undefined ? Number(payload.nota_club) : undefined;
    this.nota_host = payload.nota_host !== undefined ? Number(payload.nota_host) : undefined;
    this.nota_companeros =
      payload.nota_companeros !== undefined ? Number(payload.nota_companeros) : undefined;
    this.feedback_version =
      payload.feedback_version || (payload.nota_app !== undefined ? 'v2' : null);
    this.repetiria = Boolean(payload.repetiria);
    this.traeria_amigo = Boolean(payload.traeria_amigo);
    this.comentario = payload.comentario || '';
    this.fecha = payload.fecha || null;
    this.createdAt = null;
  }

  static validate(data) {
    const required = ['user_id', 'experience_id'];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return `Campo requerido: ${field}`;
      }
    }

    const hasLegacy =
      data.nota_1_10 !== undefined && data.nota_1_10 !== null && data.nota_1_10 !== '';
    const v2Fields = ['nota_app', 'nota_club', 'nota_host', 'nota_companeros'];
    const hasAnyV2 = v2Fields.some(
      (field) => data[field] !== undefined && data[field] !== null && data[field] !== ''
    );

    if (!hasLegacy && !hasAnyV2) {
      return 'Campo requerido: nota_1_10';
    }

    if (hasLegacy) {
      if (
        !Number.isInteger(Number(data.nota_1_10)) ||
        Number(data.nota_1_10) < 1 ||
        Number(data.nota_1_10) > 10
      ) {
        return 'nota_1_10 debe ser un número entero entre 1 y 10';
      }
    }

    if (hasAnyV2) {
      for (const field of v2Fields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          return `Campo requerido: ${field}`;
        }
        if (
          !Number.isInteger(Number(data[field])) ||
          Number(data[field]) < 1 ||
          Number(data[field]) > 10
        ) {
          return `${field} debe ser un número entero entre 1 y 10`;
        }
      }
    }
    return null;
  }

  toFirestore(FieldValue) {
    const data = {
      user_id: this.user_id,
      experience_id: this.experience_id,
      repetiria: this.repetiria,
      traeria_amigo: this.traeria_amigo,
      comentario: this.comentario,
      fecha: this.fecha || FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };
    if (this.nota_1_10 !== undefined) data.nota_1_10 = this.nota_1_10;
    if (this.nota_app !== undefined) data.nota_app = this.nota_app;
    if (this.nota_club !== undefined) data.nota_club = this.nota_club;
    if (this.nota_host !== undefined) data.nota_host = this.nota_host;
    if (this.nota_companeros !== undefined) data.nota_companeros = this.nota_companeros;
    if (this.feedback_version) data.feedback_version = this.feedback_version;
    return data;
  }
}

module.exports = Feedback;
