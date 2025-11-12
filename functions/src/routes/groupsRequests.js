const exprees = require('express');
const router = exprees.Router();
const authMiddleware = require("../middleware/auth");

const {
  getGroupRequests,
  sendRequest,
  approveRequest,
  rejectedRequest,
} = require("../controllers/groupRequests.controller");

router.post("/:groupId", authMiddleware, sendRequest);
router.get("/:groupId", authMiddleware, getGroupRequests);
router.patch("/:id/approve", authMiddleware, approveRequest);
router.patch("/:id/reject", authMiddleware, rejectedRequest);

module.exports = router;