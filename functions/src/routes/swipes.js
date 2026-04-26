const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { recordSwipe } = require("../controllers/swipes.controller");
const rateLimit = require("express-rate-limit");

const swipeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 swipe requests per windowMs
});

router.get("/check", (req, res) => {
  return res.status(200).json({ success: true, message: "Rutas de swipes cargadas" });
});

router.post("/", swipeRateLimiter, authMiddleware, recordSwipe);

module.exports = router;

