// /functions/src/controllers/groupRequest.controller.js

class GroupRequest {
  constructor(id, data = {}) {
    if (typeof data !== "object" || data === null) data = {}; // Asegura que data es un objeto

    // Identificadores
    this.id = id || null;
    this.groupId = data.groupId || null;
    this.userId = data.userId || null;

    // Información básica
    this.status = data.status || 'pending' // pendiente | aceptada | rechazada
    this.createdAt = data.createdAt || new Date();
    this.updateAt = data.updateAt || null;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new GroupRequest(doc.id, data);
  }

  toFirestore() {
    return {
      groupId: this.groupId,
      userId: this.userId,
      status: this.status,
      createdAt: this.createdAt,
      updateAt: this.updateAt,
    };
  }
}

module.exports = GroupRequest;