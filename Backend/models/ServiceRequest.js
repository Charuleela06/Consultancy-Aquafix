const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  address: String,
  serviceType: String,
  message: String,
  image: {
    data: String,
    contentType: String,
    filename: String
  },
  status: { type: String, default: "Pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  billAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: "Unpaid" },
  paymentHistory: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: String
  }],
  stripeCheckoutSessionId: String,
  stripePaymentIntentId: String
}, { timestamps: true });

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
