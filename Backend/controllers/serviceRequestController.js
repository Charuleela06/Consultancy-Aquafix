const ServiceRequest = require("../models/ServiceRequest");

exports.createRequest = async (req, res) => {
  try {
    const request = new ServiceRequest({
      ...req.body,
      userId: req.user.id
    });
    await request.save();
    res.status(201).json({ message: "Request Submitted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }
    const requests = await ServiceRequest.find(query)
      .populate("assignedStaff", "name phoneNumber")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate("assignedStaff", "name phoneNumber");
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignStaff = async (req, res) => {
  try {
    const { requestId, staffId } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { assignedStaff: staffId },
      { new: true }
    ).populate("assignedStaff", "name");
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBillAmount = async (req, res) => {
  try {
    const { requestId, billAmount } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { billAmount },
      { new: true }
    ).populate("assignedStaff", "name");
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
