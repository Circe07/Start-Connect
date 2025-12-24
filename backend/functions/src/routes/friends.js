const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const friendsController = require("../controllers/friends.controller");

router.get("/", authMiddleware, friendsController.listFriends);
router.post("/", authMiddleware, friendsController.addFriend);
router.delete("/:friendId", authMiddleware, friendsController.removeFriend);

module.exports = router;
