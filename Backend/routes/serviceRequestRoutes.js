const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const { createRequest, getRequests, assignStaff, updateStatus, updateBillAmount, updatePaymentStatus, getRequestImage } = require("../controllers/serviceRequestController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", auth, upload.single("image"), createRequest);
router.get("/", auth, getRequests);
router.get("/:id/image", auth, getRequestImage);
router.put("/assign", auth, assignStaff);
router.put("/status", auth, updateStatus);
router.put("/bill", auth, updateBillAmount);
router.put("/payment-status", auth, updatePaymentStatus);

module.exports = router;
