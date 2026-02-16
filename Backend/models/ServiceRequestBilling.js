const mongoose = require("mongoose");

const BillingItemSchema = new mongoose.Schema({
  description: String,
  unit: String,
  qty: Number,
  rate: Number,
  total: Number
});

const ServiceRequestBillingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  billTo: {
    name: String,
    address: String,
    state: String,
    stateCode: String,
    gstin: String
  },
  items: [BillingItemSchema],
  subtotal: Number,
  cgstRate: { type: Number, default: 9 },
  sgstRate: { type: Number, default: 9 },
  cgstAmount: Number,
  sgstAmount: Number,
  grandTotal: Number,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("ServiceRequestBilling", ServiceRequestBillingSchema);
