const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getAvailability,
} = require("../controllers/bookings.controller");

router.get("/check", (req, res) => {
  return res
    .status(200)
    .json({
      success: true,
      message: "Rutas de reservas cargadas correctamente",
    });
});

router.post("/", authMiddleware, createBooking);
router.get("/me", authMiddleware, getMyBookings);
router.get("/:venueId/:facilityId/:date", getAvailability);

module.exports = router;
