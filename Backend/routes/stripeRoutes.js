const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createCheckoutSession, verifyCheckoutSession } = require("../controllers/stripeController");

router.post("/checkout-session", auth, createCheckoutSession);
router.get("/verify", auth, verifyCheckoutSession);

module.exports = router;
