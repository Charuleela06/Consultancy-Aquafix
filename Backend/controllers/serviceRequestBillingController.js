const ServiceRequestBilling = require("../models/ServiceRequestBilling");
const ServiceRequest = require("../models/ServiceRequest");

const requireAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const updateRequestBillingSummary = async (requestId) => {
  const bills = await ServiceRequestBilling.find({ requestId, status: { $ne: "Rejected" } }).sort({ createdAt: 1 });
  const lastApproved = [...bills].reverse().find((b) => b.status === "Approved") || null;

  await ServiceRequest.findByIdAndUpdate(requestId, {
    billAmount: lastApproved ? lastApproved.grandTotal : 0,
    paymentStatus: "Unpaid"
  });
};

exports.createBill = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const bill = new ServiceRequestBilling(req.body);
    await bill.save();
    await updateRequestBillingSummary(bill.requestId);
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBillsByRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = String(request.userId) === String(req.user?.id);
    const isAssignedStaff = request.assignedStaff && String(request.assignedStaff) === String(req.user?.id);
    if (!isAdmin && !isOwner && !isAssignedStaff) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bills = await ServiceRequestBilling.find({ requestId: req.params.requestId }).sort({ createdAt: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const bill = await ServiceRequestBilling.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (bill) {
      await updateRequestBillingSummary(bill.requestId);
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const bill = await ServiceRequestBilling.findById(req.params.id);
    if (bill) {
      const requestId = bill.requestId;
      await ServiceRequestBilling.findByIdAndDelete(req.params.id);
      await updateRequestBillingSummary(requestId);
    }
    res.json({ message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
