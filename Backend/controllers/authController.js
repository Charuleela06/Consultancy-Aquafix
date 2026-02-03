const User = require("../models/User");
const ServiceRequest = require("../models/ServiceRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber
    });

    await user.save();
    res.status(201).json({ message: "User Registered Successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("name email phoneNumber _id");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableStaff = async (req, res) => {
  try {
    // Get all staff
    const allStaff = await User.find({ role: "staff" }).select("name _id");
    
    // Get currently assigned staff IDs from requests that are not 'Completed'
    const assignedStaffIds = await ServiceRequest.find({ 
      assignedStaff: { $exists: true },
      status: { $ne: "Completed" } 
    }).distinct("assignedStaff");

    // Filter out assigned staff
    const availableStaff = allStaff.filter(staff => !assignedStaffIds.map(id => id.toString()).includes(staff._id.toString()));
    
    res.json(availableStaff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
