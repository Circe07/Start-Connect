const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getGroupRequests,
  sendRequest,
  approveRequest,
  rejectedRequest,
} = require("../controllers/groupRequests.controller");

/**
 * @swagger
 * tags:
 *   - name: GroupRequests
 *     description: Group join request management
 */

/**
 * @swagger
 * /groupsRequests/check:
 *   get:
 *     summary: Check if group requests routes are loaded
 *     tags: [GroupRequests]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
// GET /check
router.get("/check", (req, res) => {
  return res.status(200).json({
    succes: true,
    message: "Rutas de peticiones cargadas"
  });
});

/**
 * @swagger
 * /groupsRequests/{groupId}:
 *   post:
 *     summary: Send a join request to a group
 *     tags: [GroupRequests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       201:
 *         description: Join request sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:groupId", authMiddleware, sendRequest);

/**
 * @swagger
 * /groupsRequests/{groupId}:
 *   get:
 *     summary: Get join requests for a group
 *     tags: [GroupRequests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of join requests
 *       401:
 *         description: Unauthorized
 */
router.get("/:groupId", authMiddleware, getGroupRequests);

/**
 * @swagger
 * /groupsRequests/{requestId}/approve:
 *   patch:
 *     summary: Approve a group join request
 *     tags: [GroupRequests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     responses:
 *       200:
 *         description: Request approved successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:requestId/approve", authMiddleware, approveRequest);

/**
 * @swagger
 * /groupsRequests/{requestId}/reject:
 *   patch:
 *     summary: Reject a group join request
 *     tags: [GroupRequests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:requestId/reject", authMiddleware, rejectedRequest);

module.exports = router;