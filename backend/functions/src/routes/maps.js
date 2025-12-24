const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getNearbyPlaces, searchPlaces } = require("../controllers/maps.controller");

// GET /check
router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de mapas cargadas"
    });
});

// GET /nearby - Obtener lugares cercanos (Requiere autenticación)
router.get("/nearby", authMiddleware, getNearbyPlaces);
router.get("/search", authMiddleware, searchPlaces);

module.exports = router;
