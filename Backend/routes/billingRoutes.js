const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createBill, getBillsByProject, updateBill, deleteBill } = require("../controllers/billingController");

router.post("/", auth, createBill);
router.get("/project/:projectId", auth, getBillsByProject);
router.put("/:id", auth, updateBill);
router.delete("/:id", auth, deleteBill);

module.exports = router;
