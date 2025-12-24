class Chat {
  constructor(id, data = {}) {
    const safeData = typeof data === "object" && data !== null ? data : {};

    this.id = id || null;
    this.participantIds = Array.isArray(safeData.participantIds)
      ? safeData.participantIds
      : [];
    this.participantProfiles = safeData.participantProfiles || {};
    this.participantHash = safeData.participantHash || null;
    this.metadata = safeData.metadata || {};
    this.lastMessage = safeData.lastMessage || null;
    this.lastMessageAt = safeData.lastMessageAt || null;
    this.unreadCount = safeData.unreadCount || {};
    this.createdAt = safeData.createdAt || null;
    this.updatedAt = safeData.updatedAt || null;
  }

  static fromFirestore(doc) {
    const data = doc.data() || {};
    return new Chat(doc.id, data);
  }

  toFirestore(FieldValue) {
    return {
      participantIds: this.participantIds,
      participantProfiles: this.participantProfiles,
      participantHash:
        this.participantHash || this.participantIds.slice().sort().join(":"),
      metadata: this.metadata,
      lastMessage: this.lastMessage,
      lastMessageAt: this.lastMessageAt || FieldValue.serverTimestamp(),
      unreadCount: this.unreadCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Chat;
