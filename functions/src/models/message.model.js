// functions/src/models/message.model.js

class Message {
    constructor(id, data = {}) {
        if (typeof data !== "object" || data === null) data = {};

        this.id = id || null;
        this.groupId = data.groupId || null;
        this.userId = data.userId || null;
        this.content = data.content || "";
        this.createdAt = data.createdAt || new Date();
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new Message(doc.id, data);
    }

    toFirestore() {
        return {
            groupId: this.groupId,
            userId: this.userId,
            content: this.content,
            createdAt: this.createdAt,
        };
    }
}

module.exports = Message;
