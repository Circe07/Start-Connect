class ChatMessage {
  constructor(id, data = {}) {
    const safeData = typeof data === "object" && data !== null ? data : {};

    this.id = id || null;
    this.chatId = safeData.chatId || null;
    this.senderId = safeData.senderId || null;
    this.text = safeData.text || "";
    this.attachments = Array.isArray(safeData.attachments)
      ? safeData.attachments
      : [];
    this.createdAt = safeData.createdAt || null;
    this.isReadBy = safeData.isReadBy || {};
  }

  static validate(data) {
    if (!data || typeof data !== "object") {
      return "Datos inválidos";
    }

    if (!data.text || typeof data.text !== "string") {
      return "El mensaje es requerido";
    }

    return null;
  }

  static fromFirestore(doc) {
    const data = doc.data() || {};
    return new ChatMessage(doc.id, data);
  }

  toFirestore(FieldValue) {
    return {
      chatId: this.chatId,
      senderId: this.senderId,
      text: this.text,
      attachments: this.attachments,
      createdAt: FieldValue.serverTimestamp(),
      isReadBy:
        Object.keys(this.isReadBy || {}).length > 0
          ? this.isReadBy
          : { [this.senderId]: true },
    };
  }
}

module.exports = ChatMessage;
