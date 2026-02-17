const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getAvailability,
} = require("../controllers/bookings.controller");

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Center booking management
 */

/**
 * @swagger
 * /bookings/check:
 *   get:
 *     summary: Check if bookings routes are loaded
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
router.get("/check", (req, res) => {
  return res
    .status(200)
    .json({
      success: true,
      message: "Rutas de reservas cargadas correctamente",
    });
});

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venueId
 *               - facilityId
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               venueId:
 *                 type: string
 *                 description: Venue/Center ID
 *               facilityId:
 *                 type: string
 *                 description: Facility ID within venue
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Booking date (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 description: Start time (HH:MM)
 *               endTime:
 *                 type: string
 *                 description: End time (HH:MM)
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createBooking);

/**
 * @swagger
 * /bookings/me:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getMyBookings);

/**
 * @swagger
 * /bookings/{venueId}/{facilityId}/{date}:
 *   get:
 *     summary: Get availability for a facility on a specific date
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: venueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue/Center ID
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Availability information
 *       404:
 *         description: Facility not found
 */
router.get("/:venueId/:facilityId/:date", getAvailability);

module.exports = router;
