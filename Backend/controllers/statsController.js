const Project = require("../models/Project");
const GovernmentProject = require("../models/GovernmentProject");
const ServiceRequest = require("../models/ServiceRequest");

exports.getStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pendingRequests = await ServiceRequest.countDocuments({ status: "Pending" });
    const govtProjects = await GovernmentProject.countDocuments();
    
    // For active tasks, we can assume projects with "Ongoing" status
    const activeTasks = await Project.countDocuments({ status: "Ongoing" });

    res.json({
      totalProjects,
      pendingRequests,
      govtProjects,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
