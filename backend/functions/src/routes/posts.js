const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const postsController = require("../controllers/posts.controller");

router.get("/", authMiddleware, postsController.listPosts);
router.get("/:postId", authMiddleware, postsController.getPost);
router.post("/", authMiddleware, postsController.createPost);
router.delete("/:postId", authMiddleware, postsController.deletePost);
router.post("/:postId/like", authMiddleware, postsController.toggleLike);
router.post("/:postId/comments", authMiddleware, postsController.addComment);
router.get("/:postId/comments", authMiddleware, postsController.getComments);
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  postsController.deleteComment
);
router.post("/:postId/share", authMiddleware, postsController.sharePost);

module.exports = router;
