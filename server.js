const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // serve frontend

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authdb";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// Middleware to protect routes
function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token" });
  }
}

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "secretkey", { expiresIn: "1h" });
    res.json({ msg: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route
app.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


