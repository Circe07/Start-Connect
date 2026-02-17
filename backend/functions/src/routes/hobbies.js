const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
    getAllHobbies,
    getMyHobbies,
    addHobbiesToUser,
    getUsersByHobby,
    removeHobbiesFromUser,
} = require("../controllers/hobbies.controller");

/**
 * @swagger
 * tags:
 *   - name: Hobbies
 *     description: Hobby management and retrieval endpoints
 */

/**
 * @swagger
 * /hobbies/check:
 *   get:
 *     summary: Check if hobbies routes are loaded
 *     tags: [Hobbies]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de hobbies cargadas"
    });
});

/**
 * @swagger
 * /hobbies:
 *   get:
 *     summary: Get all available hobbies
 *     tags: [Hobbies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all hobbies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hobby'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getAllHobbies);

/**
 * @swagger
 * /hobbies/me:
 *   get:
 *     summary: Get current user's hobbies
 *     tags: [Hobbies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's hobbies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hobby'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getMyHobbies);

/**
 * @swagger
 * /hobbies/me:
 *   post:
 *     summary: Add hobbies to current user
 *     tags: [Hobbies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hobbyIds
 *             properties:
 *               hobbyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of hobby IDs to add
 *     responses:
 *       200:
 *         description: Hobbies added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hobby'
 *       400:
 *         description: Invalid hobby IDs
 *       401:
 *         description: Unauthorized
 */
router.post("/me", authMiddleware, addHobbiesToUser);

/**
 * @swagger
 * /hobbies/{hobbyId}/users:
 *   get:
 *     summary: Get all users with a specific hobby
 *     tags: [Hobbies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hobbyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hobby ID
 *     responses:
 *       200:
 *         description: List of users with this hobby
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Hobby not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:hobbyId/users", authMiddleware, getUsersByHobby);

/**
 * @swagger
 * /hobbies/{hobbyId}:
 *   delete:
 *     summary: Remove hobby from current user
 *     tags: [Hobbies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hobbyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hobby ID to remove
 *     responses:
 *       200:
 *         description: Hobby removed successfully
 *       404:
 *         description: Hobby not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:hobbyId", authMiddleware, removeHobbiesFromUser);

module.exports = router;