const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/requests", require("./routes/serviceRequestRoutes"));
app.use("/api/request-billing", require("./routes/serviceRequestBillingRoutes"));
app.use("/api/government", require("./routes/governmentRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
