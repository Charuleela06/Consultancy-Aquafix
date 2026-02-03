const express = require("express");
const router = express.Router();
const { register, login, getStaff, getAvailableStaff } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/staff", auth, getStaff);
router.get("/staff/available", auth, getAvailableStaff);

module.exports = router;