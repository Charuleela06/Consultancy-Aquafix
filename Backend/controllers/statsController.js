const Project = require("../models/Project");
const GovernmentProject = require("../models/GovernmentProject");
const ServiceRequest = require("../models/ServiceRequest");
const Billing = require("../models/Billing");
const User = require("../models/User");

exports.getStats = async (req, res) => {
  try {
    const totalServiceRequests = await ServiceRequest.countDocuments();
    const completedRequests = await ServiceRequest.countDocuments({ status: "Completed" });
    const pendingRequests = await ServiceRequest.countDocuments({ status: "Pending" });

    // Revenue from completed service requests
    const revenueResult = await ServiceRequest.aggregate([
      { $match: { status: "Completed", paymentStatus: "Paid" } },
      { $unwind: "$paymentHistory" },
      { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Expenses: staff salaries from billing
    const expenseResult = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: "$staffSalaryAmount" } } }
    ]);
    const staffSalaryExpenses = expenseResult.length > 0 ? expenseResult[0].total : 0;

    // Government project budgets
    const govtBudgetResult = await GovernmentProject.aggregate([
      { $group: { _id: null, total: { $sum: "$budget" } } }
    ]);
    const governmentProjectBudgets = govtBudgetResult.length > 0 ? govtBudgetResult[0].total : 0;

    // Pending payments: service requests with paymentStatus not Paid
    const pendingPayments = await ServiceRequest.countDocuments({ paymentStatus: { $ne: "Paid" } });

    // Additional stats
    const govtProjects = await GovernmentProject.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeTasks = await Project.countDocuments({ status: "Ongoing" });

    res.json({
      totalServiceRequests,
      completedRequests,
      totalRevenue,
      staffSalaryExpenses,
      governmentProjectBudgets,
      pendingPayments,
      totalProjects,
      pendingRequests,
      govtProjects,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
