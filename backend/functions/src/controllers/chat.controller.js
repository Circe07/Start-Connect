/**
 * Controller Chat
 * This controller manages one-to-one and group chat functionality
 * Features: Create chats, send messages, retrieve chat history, mark as read
 */

const Chat = require("../models/chat.model");
const ChatMessage = require("../models/chatMessage.model");
const { db, FieldValue } = require("../config/firebase");

const chatsCollection = () => db.collection("chats");
const usersCollection = () => db.collection("users");

/**
 * Helper function to fetch and build user profile information for chat participants
 * @param {Array<string>} participantIds - Array of user IDs
 * @returns {Object} Map of userId to user profile summary
 */
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

/**
 * Helper function to convert Firestore timestamps to milliseconds
 * Handles multiple timestamp formats for compatibility
 * @param {*} value - Timestamp in any format (Firestore, Date, milliseconds)
 * @returns {number} Milliseconds since epoch
 */
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

/**
 * Helper function to verify user is a chat participant
 * Throws error if user is not part of the chat
 * @param {string} chatId - Chat document ID
 * @param {string} userId - User ID to verify
 * @returns {Object} Chat reference, document, and parsed chat data
 */
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

/**
 * Helper function to convert Firestore document to client message format
 * @param {DocumentSnapshot} doc - Firestore message document
 * @returns {Object} Formatted message with ID and data
 */
const toClientMessage = (doc) => ({ id: doc.id, ...doc.data() });

/**
 * GET - Retrieve all chats for authenticated user
 * Returns user's chats sorted by most recent activity
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Array} List of chats with participants and last message
 */
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

/**
 * POST - Create a new chat between participants
 * Creates a 2-person or group chat with participant profiles
 * Returns existing chat if participants already have a conversation
 * @param {Request} req - Express request object
 * @param {Request} req.body.participants - Array of user IDs (excluding current user)
 * @param {Request} req.body.metadata - Optional metadata for the chat
 * @param {Response} res - Express response object
 * @returns {Object} Chat ID and complete chat data
 */
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

/**
 * GET - Retrieve messages for a specific chat
 * Pagination support using cursor-based navigation
 * Requires user to be a chat participant
 * @param {Request} req - Express request object
 * @param {Request} req.params.chatId - Chat ID
 * @param {Request} req.query.limit - Number of messages to fetch (default 50, max 100)
 * @param {Request} req.query.cursor - Message ID to start pagination from
 * @param {Response} res - Express response object
 * @returns {Object} Chat data, messages array, and next cursor for pagination
 */
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

/**
 * POST - Send a message to a chat
 * Creates new message, updates unread counts for other participants
 * User must be a chat participant
 * @param {Request} req - Express request object
 * @param {Request} req.params.chatId - Chat ID
 * @param {Request} req.body.text - Message text content (required)
 * @param {Request} req.body.attachments - Optional array of file attachments
 * @param {Response} res - Express response object
 * @returns {Object} Created message data with ID
 */
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

/**
 * POST - Mark a chat as read for the current user
 * Resets unread message count to zero
 * @param {Request} req - Express request object
 * @param {Request} req.params.chatId - Chat ID to mark as read
 * @param {Response} res - Express response object
 * @returns {Object} Success message
 */
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
