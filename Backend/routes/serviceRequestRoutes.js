const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createRequest, getRequests, assignStaff, updateStatus, updateBillAmount, updatePaymentStatus } = require("../controllers/serviceRequestController");

router.post("/", auth, createRequest);
router.get("/", auth, getRequests);
router.put("/assign", auth, assignStaff);
router.put("/status", auth, updateStatus);
router.put("/bill", auth, updateBillAmount);
router.put("/payment-status", auth, updatePaymentStatus);

module.exports = router;
