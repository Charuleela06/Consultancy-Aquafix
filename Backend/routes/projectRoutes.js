const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addProject, getProjects } = require("../controllers/projectController");

router.post("/", auth, addProject);
router.get("/", getProjects);

module.exports = router;
