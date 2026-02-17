const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contacts.controller");

/**
 * @swagger
 * tags:
 *   - name: Contacts
 *     description: User contacts/friends management
 */

/**
 * @swagger
 * /contacts/check:
 *   get:
 *     summary: Check if contacts routes are loaded
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: Routes are loaded successfully
 */
// GET /check
router.get("/check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Rutas de contactos cargadas"
  });
});

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts for current user
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of contacts
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getAllContacts);

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add as contact
 *               label:
 *                 type: string
 *                 description: Contact label or name
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createContact);

/**
 * @swagger
 * /contacts/{id}:
 *   patch:
 *     summary: Update a contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id", authMiddleware, updateContact);

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, deleteContact);

module.exports = router;
