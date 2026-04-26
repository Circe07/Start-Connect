const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { listMatches } = require("../controllers/matches.controller");
const rateLimit = require("express-rate-limit");

const matchesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for matches
});

router.get("/check", (req, res) => {
  return res.status(200).json({ success: true, message: "Rutas de matches cargadas" });
});

router.get("/", matchesRateLimiter, authMiddleware, listMatches);

module.exports = router;

