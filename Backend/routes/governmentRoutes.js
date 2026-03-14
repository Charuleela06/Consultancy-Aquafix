const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addGovProject, getGovProjects, getGovProjectById, updateGovProjectTasks } = require("../controllers/governmentController");

router.post("/", auth, addGovProject);
router.get("/", auth, getGovProjects);
router.get("/:id", auth, getGovProjectById);
router.put("/:id/tasks", auth, updateGovProjectTasks);

module.exports = router;
