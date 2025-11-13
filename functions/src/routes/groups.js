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
} = require("../controllers/groups.controller");

// GET routes
router.get("/public", authMiddleware, getPublicGroups);
router.get("/my-groups", authMiddleware, getMyGroups);
router.get("/:id", authMiddleware, getGroupById);
// POST routes
router.post("/", authMiddleware, createGroup);
router.post("/:id/join", authMiddleware, joinGroup);
router.post("/:id/leave", authMiddleware, leaveGroup);
router.post("/:id/post", authMiddleware, newPost);
// PATCH routes
router.patch("/:id", authMiddleware, updateGroup);
router.patch("/:id/transfer-owner/:newOwnerId", authMiddleware, transferOwner);
// DELETE routes
router.delete("/:id/remove-member/:memberId", authMiddleware, removeMember);
router.delete("/:id", authMiddleware, deleteGroup);
router.delete("/:id/post/:postId", authMiddleware, deletePost);

// Export the router
module.exports = router;