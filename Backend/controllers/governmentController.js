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
