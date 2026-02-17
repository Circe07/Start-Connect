const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
    searchUsers,
} = require("../controllers/users.controller");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User profile management endpoints
 */

/**
 * @swagger
 * /users/check:
 *   get:
 *     summary: Check if users routes are loaded
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de usuarios cargadas",
    });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Search users by query
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (name, email, etc.)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, searchUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getMyProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               bio:
 *                 type: string
 *               age:
 *                 type: integer
 *               location:
 *                 type: string
 *               photoURL:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", authMiddleware, updateMyProfile);

/**
 * @swagger
 * /users/{uid}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:uid", authMiddleware, getUserProfile);

module.exports = router;