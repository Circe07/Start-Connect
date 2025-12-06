const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
    getAllHobbies,
    getMyHobbies,
    addHobbiesToUser,
    getUsersByHobby,
    removeHobbiesFromUser,
} = require("../controllers/hobbies.controller");



router.get("/check", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Rutas de hobbies cargadas"
    });
});

router.get("/", authMiddleware, getAllHobbies);
router.get("/me", authMiddleware, getMyHobbies);
router.post("/me", authMiddleware, addHobbiesToUser);
router.get("/:hobbyId/users", authMiddleware, getUsersByHobby);
router.delete("/:hobbyId", authMiddleware, removeHobbiesFromUser);


module.exports = router;