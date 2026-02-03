const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  client: String,
  type: { type: String, enum: ["Electrical", "Plumbing"] },
  status: { type: String, default: "Ongoing" },
  location: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
