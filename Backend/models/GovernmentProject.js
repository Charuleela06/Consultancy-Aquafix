const mongoose = require("mongoose");

const GovernmentProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: String,
  location: String,
  workType: String,
  status: { type: String, default: "Ongoing" },
  approvalDate: Date,
  budget: Number,
  totalBilledAmount: { type: Number, default: 0 },
  lastBillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }
}, { timestamps: true });

module.exports = mongoose.model("GovernmentProject", GovernmentProjectSchema);
