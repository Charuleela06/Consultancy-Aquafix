const GovernmentProject = require("../models/GovernmentProject");

exports.addGovProject = async (req, res) => {
  const project = new GovernmentProject(req.body);
  await project.save();
  res.json(project);
};

exports.getGovProjects = async (req, res) => {
  const projects = await GovernmentProject.find().populate('lastBillId');
  res.json(projects);
};

exports.getGovProjectById = async (req, res) => {
  try {
    const project = await GovernmentProject.findById(req.params.id).populate('lastBillId');
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGovProjectTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) return res.status(400).json({ message: "Tasks must be an array" });

    const project = await GovernmentProject.findByIdAndUpdate(
      req.params.id,
      { tasks: tasks || [] },
      { new: true }
    ).populate('lastBillId');

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
