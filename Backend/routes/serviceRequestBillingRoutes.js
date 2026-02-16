const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBill,
  getBillsByRequest,
  updateBill,
  deleteBill
} = require("../controllers/serviceRequestBillingController");

router.post("/", auth, createBill);
router.get("/request/:requestId", auth, getBillsByRequest);
router.put("/:id", auth, updateBill);
router.delete("/:id", auth, deleteBill);

module.exports = router;
