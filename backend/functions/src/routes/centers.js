const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin");
const centersController = require("../controllers/centers.controller");

/**
 * @swagger
 * tags:
 *   - name: Centers
 *     description: Recreation centers information
 */

/**
 * @swagger
 * /centers/check:
 *   get:
 *     summary: Check if centers routes are loaded
 *     tags: [Centers]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
// Ruta de prueba
router.get("/check", async (req, res) => {
  res.status(200).json({ messsage: 'Rutas de centros funcionando correctamente' })
})

/**
 * @swagger
 * /centers:
 *   get:
 *     summary: Get all recreation centers
 *     tags: [Centers]
 *     responses:
 *       200:
 *         description: List of all centers
 *       500:
 *         description: Server error
 */
// Rutas Públicas
router.get("/", centersController.getCenters);

/**
 * @swagger
 * /centers/search:
 *   get:
 *     summary: Search for centers
 *     tags: [Centers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (name, location, etc.)
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", centersController.searchCenters);

/**
 * @swagger
 * /centers:
 *   post:
 *     summary: Create a new recreation center (Admin only)
 *     tags: [Centers]
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
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Center created successfully
 *       401:
 *         description: Unauthorized - Admin access required
 */
// Rutas Protegidas (Solo Admin)
router.post("/", adminMiddleware, centersController.createCenter);

/**
 * @swagger
 * /centers/{id}:
 *   patch:
 *     summary: Update a recreation center (Admin only)
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Center ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Center updated successfully
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.patch("/:id", adminMiddleware, centersController.updateCenter);

/**
 * @swagger
 * /centers/{id}:
 *   delete:
 *     summary: Delete a recreation center (Admin only)
 *     tags: [Centers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Center ID
 *     responses:
 *       200:
 *         description: Center deleted successfully
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.delete("/:id", adminMiddleware, centersController.deleteCenter);

module.exports = router;
