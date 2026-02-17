const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const chatController = require("../controllers/chat.controller");

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Chat messaging endpoints
 */

/**
 * @swagger
 * /chats/check:
 *   get:
 *     summary: Check if chat routes are loaded
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
router.get("/check", (_req, res) => {
  res.status(200).json({ success: true, message: "Rutas de chat cargadas" });
});

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all chats for current user
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's chats
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, chatController.getMyChats);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantUid
 *             properties:
 *               participantUid:
 *                 type: string
 *                 description: UID of the chat participant
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, chatController.createChat);

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Get messages from a chat
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:chatId/messages",
  authMiddleware,
  chatController.getChatMessages
);

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Send a message to a chat
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:chatId/messages",
  authMiddleware,
  chatController.sendMessage
);

/**
 * @swagger
 * /chats/{chatId}/read:
 *   post:
 *     summary: Mark chat as read
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat marked as read
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:chatId/read",
  authMiddleware,
  chatController.markChatAsRead
);

module.exports = router;
