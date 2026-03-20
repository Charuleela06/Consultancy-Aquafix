const ServiceRequest = require("../models/ServiceRequest");
const User = require("../models/User");

exports.createRequest = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      userId: req.user.id
    };

    if (req.file && req.file.buffer) {
      requestData.image = {
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }

    const request = new ServiceRequest(requestData);
    await request.save();
    res.status(201).json({ message: "Request Submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else {
      const { date, view } = req.query;

      if (date) {
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
        }

        if (view === "completed") {
          query.completedAt = { $gte: start, $lte: end };
        } else if (view === "pending") {
          query.createdAt = { $gte: start, $lte: end };
          query.status = { $ne: "Completed" };
        } else {
          query.createdAt = { $gte: start, $lte: end };
        }
      }
    }
    const requests = await ServiceRequest.find(query)
      .select("-image.data")
      .populate("assignedStaff", "name phoneNumber")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { requestId, status } = req.body;
    const update = { status };
    if (status === "Completed") {
      update.completedAt = new Date();
    } else {
      update.completedAt = null;
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      update,
      { new: true }
    ).populate("assignedStaff", "name phoneNumber");
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignStaff = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { requestId, staffId } = req.body;

    if (!requestId || !staffId) {
      return res.status(400).json({ message: "requestId and staffId are required" });
    }

    const staff = await User.findById(staffId).select("role");
    if (!staff || staff.role !== "staff") {
      return res.status(400).json({ message: "Invalid staff" });
    }

    const busyRequest = await ServiceRequest.findOne({
      assignedStaff: staffId,
      status: { $ne: "Completed" },
      _id: { $ne: requestId }
    }).select("_id status");

    if (busyRequest) {
      return res.status(400).json({ message: "Staff not available" });
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { assignedStaff: staffId },
      { new: true }
    ).populate("assignedStaff", "name");
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBillAmount = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { requestId, billAmount } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { billAmount: Number(billAmount) || 0 },
      { new: true }
    ).populate("assignedStaff", "name");
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { requestId, paymentStatus } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { paymentStatus },
      { new: true }
    ).populate("assignedStaff", "name phoneNumber");
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestImage = async (req, res) => {
  try {
    const { id } = req.params;

    let query = { _id: id };
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const request = await ServiceRequest.findOne(query).select("image");
    if (!request || !request.image || !request.image.data) {
      return res.status(404).json({ message: "Image not found" });
    }

    const buffer = Buffer.from(request.image.data, "base64");
    res.setHeader("Content-Type", request.image.contentType || "application/octet-stream");
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
