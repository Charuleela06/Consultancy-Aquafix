const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addGovProject, getGovProjects } = require("../controllers/governmentController");

router.post("/", auth, addGovProject);
router.get("/", auth, getGovProjects);

module.exports = router;
