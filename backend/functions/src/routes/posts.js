const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const postsController = require("../controllers/posts.controller");

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: User posts and feed
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: List of posts
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, postsController.listPosts);

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a specific post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:postId", authMiddleware, postsController.getPost);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content/text
 *               image:
 *                 type: string
 *                 description: Image URL
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, postsController.createPost);

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:postId", authMiddleware, postsController.deletePost);

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:postId/like", authMiddleware, postsController.toggleLike);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
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
 *                 description: Comment text
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:postId/comments", authMiddleware, postsController.addComment);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get comments on a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:postId/comments",
  authMiddleware,
  postsController.getComments
);

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  postsController.deleteComment
);

/**
 * @swagger
 * /posts/{postId}/share:
 *   post:
 *     summary: Share a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post shared successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:postId/share", authMiddleware, postsController.sharePost);

module.exports = router;
