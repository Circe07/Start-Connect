const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin");
const centersController = require("../controllers/centers.controller");

// Rutas Públicas
router.get("/", centersController.getCenters);
router.get("/search", centersController.searchCenters);

// Rutas Protegidas (Solo Admin)
router.post("/", adminMiddleware, centersController.createCenter);
router.delete("/:id", adminMiddleware, centersController.deleteCenter);

module.exports = router;
