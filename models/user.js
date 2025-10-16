const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, match: /.+@.+\..+/ },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
});

module.exports = mongoose.model("User", userSchema);

