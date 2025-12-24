const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const chatController = require("../controllers/chat.controller");

router.get("/check", (_req, res) => {
  res.status(200).json({ success: true, message: "Rutas de chat cargadas" });
});

router.get("/", authMiddleware, chatController.getMyChats);
router.post("/", authMiddleware, chatController.createChat);
router.get(
  "/:chatId/messages",
  authMiddleware,
  chatController.getChatMessages
);
router.post(
  "/:chatId/messages",
  authMiddleware,
  chatController.sendMessage
);
router.post(
  "/:chatId/read",
  authMiddleware,
  chatController.markChatAsRead
);

module.exports = router;
