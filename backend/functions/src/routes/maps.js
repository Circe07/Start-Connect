const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getNearbyPlaces, searchPlaces } = require("../controllers/maps.controller");

/**
 * @swagger
 * tags:
 *   - name: Maps
 *     description: Maps and location-based features
 */

/**
 * @swagger
 * /maps/check:
 *   get:
 *     summary: Check if maps routes are loaded
 *     tags: [Maps]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
// GET /check
router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de mapas cargadas"
    });
});

/**
 * @swagger
 * /maps/nearby:
 *   get:
 *     summary: Get nearby places for current user location
 *     tags: [Maps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby places
 *       401:
 *         description: Unauthorized
 */
// GET /nearby - Obtener lugares cercanos (Requiere autenticación)
router.get("/nearby", authMiddleware, getNearbyPlaces);

/**
 * @swagger
 * /maps/search:
 *   get:
 *     summary: Search for places by name or location
 *     tags: [Maps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
router.get("/search", authMiddleware, searchPlaces);

module.exports = router;
