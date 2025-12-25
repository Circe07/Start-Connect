class Post {
  constructor(id, data = {}) {
    const safeData = typeof data === "object" && data !== null ? data : {};

    this.id = id || null;
    this.authorId = safeData.authorId || null;
    this.authorProfile = safeData.authorProfile || null;
    this.caption = typeof safeData.caption === "string" ? safeData.caption : "";
    this.media = Array.isArray(safeData.media) ? safeData.media : [];
    this.likeCount = safeData.likeCount || 0;
    this.commentCount = safeData.commentCount || 0;
    this.shareCount = safeData.shareCount || 0;
    this.tags = Array.isArray(safeData.tags) ? safeData.tags : [];
    this.location = safeData.location || null;
    this.visibility = safeData.visibility || "public";
    this.createdAt = safeData.createdAt || null;
    this.updatedAt = safeData.updatedAt || null;
  }

  static fromFirestore(doc) {
    const data = doc.data() || {};
    return new Post(doc.id, data);
  }

  toFirestore(FieldValue) {
    return {
      authorId: this.authorId,
      authorProfile: this.authorProfile,
      caption: this.caption,
      media: this.media,
      likeCount: this.likeCount,
      commentCount: this.commentCount,
      shareCount: this.shareCount,
      tags: this.tags,
      location: this.location,
      visibility: this.visibility,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
}

module.exports = Post;
