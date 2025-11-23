const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getGroupRequests,
  sendRequest,
  approveRequest,
  rejectedRequest,
} = require("../controllers/groupRequests.controller");

// GET /check
router.get("/check", (req, res) => {
  return res.status(200).json({
    succes: true,
    message: "Rutas de peticiones cargadas"
  });
});

router.post("/:groupId", authMiddleware, sendRequest);
router.get("/:groupId", authMiddleware, getGroupRequests);
router.patch("/:requestId/approve", authMiddleware, approveRequest);
router.patch("/:requestId/reject", authMiddleware, rejectedRequest);

module.exports = router;