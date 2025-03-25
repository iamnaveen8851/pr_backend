const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores",
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
  },

  role: {
    type: String,
    enum: ["Admin", "Manager", "Employee"],
    default: "Employee",
  },
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
