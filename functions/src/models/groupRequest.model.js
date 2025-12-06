// functions/src/models/groupRequest.model.js

class GroupRequest {
  constructor(id, data = {}) {
    if (typeof data !== "object" || data === null) data = {};

    // Identificadores
    this.id = id || null;

    // Validación fuerte (evita errores de Firestore)
    this.groupId = typeof data.groupId === "string" && data.groupId.trim() !== ""
      ? data.groupId
      : null;

    this.userId = typeof data.userId === "string" && data.userId.trim() !== ""
      ? data.userId
      : null;

    // Información básica
    this.status = data.status || "pending"; // pending | accepted | rejected

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
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
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = GroupRequest;
