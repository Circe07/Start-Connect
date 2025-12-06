const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
} = require("../controllers/users.controller");
const authMiddleware = require("../middleware/auth");

router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de usuarios cargadas",
    });
});

router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);
router.get("/:uid", authMiddleware, getUserProfile);

module.exports = router;