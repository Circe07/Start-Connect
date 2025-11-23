const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getPublicGroups,
  getMyGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  newPost,
  updateGroup,
  transferOwner,
  removeMember,
  deleteGroup,
  deletePost,
  sendMessage,
  getMessages,
} = require("../controllers/groups.controller");

// GET /check
router.get("/check", (req, res) => {
  return res.status(200).json({
    succes: true,
    message: "Rutas de grupos cargadas"
  });
});
// GET routes
router.get("/public", authMiddleware, getPublicGroups);
router.get("/my-groups", authMiddleware, getMyGroups);
router.get("/:id", authMiddleware, getGroupById);
router.get("/:id/messages", authMiddleware, getMessages);
// POST routes
router.post("/", authMiddleware, createGroup);
router.post("/:id/join", authMiddleware, joinGroup);
router.post("/:id/leave", authMiddleware, leaveGroup);
router.post("/:id/post", authMiddleware, newPost);
router.post("/:id/messages", authMiddleware, sendMessage);
// PATCH routes
router.patch("/:id", authMiddleware, updateGroup);
router.patch("/:id/transfer-owner/:newOwnerId", authMiddleware, transferOwner);
// DELETE routes
router.delete("/:id/remove-member/:memberId", authMiddleware, removeMember);
router.delete("/:id", authMiddleware, deleteGroup);
router.delete("/:id/post/:postId", authMiddleware, deletePost);

// Export the router
module.exports = router;