const mongoose = require("mongoose");

const GovernmentProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  panchayatName: String,
  locationVillage: String,
  workType: String,
  status: { type: String, default: "Ongoing" },
  budget: Number,
  startDate: Date,
  endDate: Date,
  tasks: {
    type: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" }
      }
    ],
    default: () => ([])
  },
  department: String,
  location: String,
  approvalDate: Date,
  totalBilledAmount: { type: Number, default: 0 },
  lastBillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }
}, { timestamps: true });

module.exports = mongoose.model("GovernmentProject", GovernmentProjectSchema);
