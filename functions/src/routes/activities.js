const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { listActivities } = require("../controllers/activities.controller");
const rateLimit = require("express-rate-limit");

const activitiesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for activities
});

router.get("/check", (req, res) => {
  return res.status(200).json({ success: true, message: "Rutas de activities cargadas" });
});

router.get("/", activitiesLimiter, authMiddleware, listActivities);

module.exports = router;

