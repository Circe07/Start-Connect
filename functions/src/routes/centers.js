const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/admin");
const centersController = require("../controllers/centers.controller");

// Ruta de prueba
router.get("/check", async (req, res) => {
  res.status(200).json({ messsage: 'Rutas de centros funcionando correctamente' })
})
// Rutas Públicas
router.get("/", centersController.getCenters);
router.get("/search", centersController.searchCenters);

// Rutas Protegidas (Solo Admin)
router.post("/", adminMiddleware, centersController.createCenter);
router.patch("/:id", adminMiddleware, centersController.updateCenter);
router.delete("/:id", adminMiddleware, centersController.deleteCenter);

module.exports = router;
