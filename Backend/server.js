/*const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { webhook } = require("./controllers/stripeController");

const app = express();

// Middleware
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), webhook);
app.use(express.json());
app.use(cors());

// Routes

app.get("/", (req, res) => {
  res.send("Consultancy Aquafix API is running");
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/requests", require("./routes/serviceRequestRoutes"));
app.use("/api/request-billing", require("./routes/serviceRequestBillingRoutes"));
app.use("/api/government", require("./routes/governmentRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// ✅ ADD THIS
const client = require("prom-client");

// collect default system metrics
client.collectDefaultMetrics();

const { webhook } = require("./controllers/stripeController");

const app = express();

// Middleware
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), webhook);
app.use(express.json());
app.use(cors());

// ✅ ADD THIS (Prometheus endpoint)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Routes
app.get("/", (req, res) => {
  res.send("Consultancy Aquafix API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/requests", require("./routes/serviceRequestRoutes"));
app.use("/api/request-billing", require("./routes/serviceRequestBillingRoutes"));
app.use("/api/government", require("./routes/governmentRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/stripe", require("./routes/stripeRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});