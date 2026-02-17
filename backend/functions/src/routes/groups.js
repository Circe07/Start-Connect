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
  deleteMessage,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/groups.controller");

/**
 * @swagger
 * tags:
 *   - name: Groups
 *     description: Group creation and management endpoints
 */

/**
 * @swagger
 * /groups/check:
 *   get:
 *     summary: Check if groups routes are loaded
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
// GET /check
router.get("/check", (req, res) => {
  return res.status(200).json({
    succes: true,
    message: "Rutas de grupos cargadas"
  });
});
/**
 * @swagger
 * /groups/public:
 *   get:
 *     summary: Get all public groups
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of public groups
 *       401:
 *         description: Unauthorized
 */
router.get("/public", authMiddleware, getPublicGroups);

/**
 * @swagger
 * /groups/my-groups:
 *   get:
 *     summary: Get current user's groups
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's groups
 *       401:
 *         description: Unauthorized
 */
router.get("/my-groups", authMiddleware, getMyGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get group details by ID
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, getGroupById);

/**
 * @swagger
 * /groups/{id}/messages:
 *   get:
 *     summary: Get group messages
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of group messages
 *       401:
 *         description: Unauthorized
 */
router.get("/:id/messages", authMiddleware, getMessages);

/**
 * @swagger
 * /groups/{id}/posts/{postId}/comments:
 *   get:
 *     summary: Get comments on a group post
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
router.get("/:id/posts/:postId/comments", authMiddleware, getComments);
/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               hobby:
 *                 type: string
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createGroup);

/**
 * @swagger
 * /groups/{id}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Successfully joined group
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/join", authMiddleware, joinGroup);

/**
 * @swagger
 * /groups/{id}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Successfully left group
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/leave", authMiddleware, leaveGroup);

/**
 * @swagger
 * /groups/{id}/post:
 *   post:
 *     summary: Create a new post in group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/post", authMiddleware, newPost);

/**
 * @swagger
 * /groups/{id}/messages:
 *   post:
 *     summary: Send a message to group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/messages", authMiddleware, sendMessage);

/**
 * @swagger
 * /groups/{id}/posts/{postId}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
router.post("/:id/posts/:postId/like", authMiddleware, toggleLike);

/**
 * @swagger
 * /groups/{id}/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/posts/:postId/comments", authMiddleware, addComment);
/**
 * @swagger
 * /groups/{id}:
 *   patch:
 *     summary: Update group information
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id", authMiddleware, updateGroup);

/**
 * @swagger
 * /groups/{id}/transfer-owner/{newOwnerId}:
 *   patch:
 *     summary: Transfer group ownership
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: newOwnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: New owner user ID
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id/transfer-owner/:newOwnerId", authMiddleware, transferOwner);

/**
 * @swagger
 * /groups/{id}/remove-member/{memberId}:
 *   delete:
 *     summary: Remove a member from group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member user ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id/remove-member/:memberId", authMiddleware, removeMember);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, deleteGroup);

/**
 * @swagger
 * /groups/{id}/post/{postId}:
 *   delete:
 *     summary: Delete a post from group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
router.delete("/:id/post/:postId", authMiddleware, deletePost);

/**
 * @swagger
 * /groups/{id}/messages/{messageId}:
 *   delete:
 *     summary: Delete a message from group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id/messages/:messageId", authMiddleware, deleteMessage);

/**
 * @swagger
 * /groups/{id}/posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
router.delete("/:id/posts/:postId/comments/:commentId", authMiddleware, deleteComment);

// Export the router
module.exports = router;