const Chat = require("../models/chat.model");
const ChatMessage = require("../models/chatMessage.model");
const { db, FieldValue } = require("../config/firebase");

const chatsCollection = () => db.collection("chats");
const usersCollection = () => db.collection("users");

const buildParticipantProfiles = async (participantIds = []) => {
    const entries = await Promise.all(
        participantIds.map(async (uid) => {
            if (!uid) return null;
            try {
                const snap = await usersCollection().doc(uid).get();
                if (!snap.exists) {
                    return [uid, { userId: uid }];
                }

                const data = snap.data();

                return [
                    uid,
                    {
                        userId: uid,
                        name: data.name || data.username || data.email || "Usuario",
                        username: data.username || "",
                        photo: data.photo || data.profile_img_path || "",
                    },
                ];
            } catch (error) {
                console.error("Error fetching participant profile", error);
                return [uid, { userId: uid }];
            }
        })
    );

    return entries.reduce((acc, entry) => {
        if (entry) {
            const [uid, profile] = entry;
            acc[uid] = profile;
        }
        return acc;
    }, {});
};

const timestampToMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === "function") {
        return value.toMillis();
    }
    if (typeof value.toDate === "function") {
        return value.toDate().getTime();
    }
    if (typeof value._seconds === "number") {
        const seconds = value._seconds * 1000;
        const nanos = value._nanoseconds ? value._nanoseconds / 1e6 : 0;
        return seconds + nanos;
    }
    if (value instanceof Date) {
        return value.getTime();
    }
    if (typeof value === "number") {
        return value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const ensureChatParticipant = async (chatId, userId) => {
    const chatRef = chatsCollection().doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
        const error = new Error("chat_not_found");
        error.status = 404;
        throw error;
    }

    const chat = Chat.fromFirestore(chatDoc);

    if (!chat.participantIds.includes(userId)) {
        const error = new Error("not_participant");
        error.status = 403;
        throw error;
    }

    return { chatRef, chatDoc, chat };
};

const toClientMessage = (doc) => ({ id: doc.id, ...doc.data() });

exports.getMyChats = async (req, res) => {
    try {
        const userId = req.user.uid;

        const snapshot = await chatsCollection()
            .where("participantIds", "array-contains", userId)
            .get();

        const chats = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const left = timestampToMillis(b.lastMessageAt || b.updatedAt || b.createdAt);
                const right = timestampToMillis(a.lastMessageAt || a.updatedAt || a.createdAt);
                return left - right;
            });

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error getMyChats:", error);
        res.status(500).json({ message: "Error al obtener los chats." });
    }
};

exports.createChat = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { participants = [], metadata = {} } = req.body || {};

        if (!Array.isArray(participants) || participants.length === 0) {
            return res
                .status(400)
                .json({ message: "Debes proporcionar al menos un participante." });
        }

        const participantSet = new Set(
            participants.filter((id) => typeof id === "string" && id.trim())
        );
        participantSet.add(userId);
        const participantIds = Array.from(participantSet);

        if (participantIds.length < 2) {
            return res
                .status(400)
                .json({ message: "Un chat necesita al menos dos participantes." });
        }

        const participantHash = participantIds.slice().sort().join(":");

        const existing = await chatsCollection()
            .where("participantHash", "==", participantHash)
            .limit(1)
            .get();

        if (!existing.empty) {
            const chatDoc = existing.docs[0];
            return res.status(200).json({
                success: true,
                chatId: chatDoc.id,
                chat: { id: chatDoc.id, ...chatDoc.data() },
            });
        }

        const participantProfiles = await buildParticipantProfiles(participantIds);
        const unreadCount = participantIds.reduce((acc, id) => {
            acc[id] = 0;
            return acc;
        }, {});

        const chat = new Chat(null, {
            participantIds,
            participantProfiles,
            participantHash,
            metadata,
            unreadCount,
            lastMessageAt: null,
        });

        const docRef = await chatsCollection().add(chat.toFirestore(FieldValue));
        const createdDoc = await docRef.get();

        res.status(201).json({
            success: true,
            chatId: docRef.id,
            chat: { id: docRef.id, ...createdDoc.data() },
        });
    } catch (error) {
        console.error("Error createChat:", error);
        res.status(500).json({ message: "Error al crear el chat." });
    }
};

exports.getChatMessages = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { chatId } = req.params;
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
        const cursor = req.query.cursor;

        const { chatRef, chatDoc } = await ensureChatParticipant(chatId, userId);

        let query = chatRef
            .collection("messages")
            .orderBy("createdAt", "asc")
            .limit(limit);

        if (cursor) {
            const cursorDoc = await chatRef.collection("messages").doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        const snapshot = await query.get();
        const messages = snapshot.docs.map(toClientMessage);

        res.status(200).json({
            success: true,
            chat: { id: chatDoc.id, ...chatDoc.data() },
            messages,
            nextCursor:
                snapshot.size === limit && snapshot.docs.length > 0
                    ? snapshot.docs[snapshot.docs.length - 1].id
                    : null,
        });
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({ message: "El chat no existe" });
        }
        if (error.status === 403) {
            return res.status(403).json({ message: "No perteneces a este chat" });
        }

        console.error("Error getChatMessages:", error);
        res.status(500).json({ message: "Error al obtener los mensajes." });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { chatId } = req.params;
        const { text, attachments = [] } = req.body || {};

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "El mensaje es requerido" });
        }

        const { chatRef, chat } = await ensureChatParticipant(chatId, userId);
        const normalizedText = text.trim();

        const message = new ChatMessage(null, {
            chatId,
            senderId: userId,
            text: normalizedText,
            attachments,
            isReadBy: { [userId]: true },
        });

        const messageRef = chatRef.collection("messages").doc();
        await messageRef.set(message.toFirestore(FieldValue));

        const unreadUpdates = {};
        chat.participantIds.forEach((participantId) => {
            unreadUpdates[`unreadCount.${participantId}`] =
                participantId === userId ? 0 : FieldValue.increment(1);
        });

        await chatRef.update({
            lastMessage: {
                text: normalizedText,
                senderId: userId,
                createdAt: FieldValue.serverTimestamp(),
            },
            lastMessageAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            ...unreadUpdates,
        });

        const storedMessage = await messageRef.get();

        res.status(201).json({
            success: true,
            message: toClientMessage(storedMessage),
        });
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({ message: "El chat no existe" });
        }
        if (error.status === 403) {
            return res.status(403).json({ message: "No perteneces a este chat" });
        }

        console.error("Error sendMessage:", error);
        res.status(500).json({ message: "Error al enviar el mensaje." });
    }
};

exports.markChatAsRead = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { chatId } = req.params;

        const { chatRef } = await ensureChatParticipant(chatId, userId);

        await chatRef.update({
            [`unreadCount.${userId}`]: 0,
            updatedAt: FieldValue.serverTimestamp(),
        });

        res.status(200).json({ success: true });
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({ message: "El chat no existe" });
        }
        if (error.status === 403) {
            return res.status(403).json({ message: "No perteneces a este chat" });
        }

        console.error("Error markChatAsRead:", error);
        res.status(500).json({ message: "Error al actualizar el chat." });
    }
};
