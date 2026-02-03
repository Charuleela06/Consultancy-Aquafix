const Billing = require("../models/Billing");
const GovernmentProject = require("../models/GovernmentProject");

const updateProjectBudget = async (projectId) => {
  const bills = await Billing.find({ projectId, status: { $ne: 'Rejected' } }).sort({ createdAt: 1 });
  const total = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const lastBill = bills.length > 0 ? bills[bills.length - 1]._id : null;
  
  await GovernmentProject.findByIdAndUpdate(projectId, {
    totalBilledAmount: total,
    lastBillId: lastBill
  });
};

exports.createBill = async (req, res) => {
  try {
    const bill = new Billing(req.body);
    await bill.save();
    await updateProjectBudget(bill.projectId);
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBillsByProject = async (req, res) => {
  try {
    const bills = await Billing.find({ projectId: req.params.projectId });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await updateProjectBudget(bill.projectId);
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (bill) {
      const projectId = bill.projectId;
      await Billing.findByIdAndDelete(req.params.id);
      await updateProjectBudget(projectId);
    }
    res.json({ message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
