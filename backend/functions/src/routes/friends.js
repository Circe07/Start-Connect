const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const friendsController = require("../controllers/friends.controller");

/**
 * @swagger
 * tags:
 *   - name: Friends
 *     description: Friend list management
 */

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: List all friends
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, friendsController.listFriends);

/**
 * @swagger
 * /friends:
 *   post:
 *     summary: Add a friend
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friendId
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: User ID to add as friend
 *     responses:
 *       201:
 *         description: Friend added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, friendsController.addFriend);

/**
 * @swagger
 * /friends/{friendId}:
 *   delete:
 *     summary: Remove a friend
 *     tags: [Friends]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend user ID
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:friendId", authMiddleware, friendsController.removeFriend);

module.exports = router;
