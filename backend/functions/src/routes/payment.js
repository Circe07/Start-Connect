const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
