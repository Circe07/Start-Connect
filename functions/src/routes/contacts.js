const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contacts.controller");

router.get("/", authMiddleware, getAllContacts);
router.post("/", authMiddleware, createContact);
router.patch("/:id", authMiddleware, updateContact);
router.delete("/:id", authMiddleware, deleteContact);

module.exports = router;
