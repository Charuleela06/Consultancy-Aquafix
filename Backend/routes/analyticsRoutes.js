const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getRevenueAnalytics } = require("../controllers/analyticsController");

router.get("/revenue", auth, getRevenueAnalytics);

module.exports = router;
