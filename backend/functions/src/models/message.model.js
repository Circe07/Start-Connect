class Message {
  constructor(id, data = {}) {
    const safeData = typeof data === "object" && data !== null ? data : {};

    this.id = id || null;
    this.groupId = safeData.groupId || null;
    this.userId = safeData.userId || null;
    this.content = safeData.content || "";
    this.imageUrl = safeData.imageUrl || null;
    this.likes = typeof safeData.likes === "number" ? safeData.likes : 0;
    this.commentCount = typeof safeData.commentCount === "number" ? safeData.commentCount : 0;
    this.createdAt = safeData.createdAt || null;
    this.authorProfile = safeData.authorProfile || null;
  }

  static fromFirestore(doc) {
    const data = doc.data() || {};
    return new Message(doc.id, data);
  }

  toFirestore() {
    return {
      groupId: this.groupId,
      userId: this.userId,
      content: this.content,
      imageUrl: this.imageUrl,
      likes: this.likes,
      commentCount: this.commentCount,
      createdAt: this.createdAt || new Date(),
      authorProfile: this.authorProfile,
    };
  }
}

module.exports = Message;
