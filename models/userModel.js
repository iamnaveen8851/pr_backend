const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    // minlength: [3, "Username must be at least 3 characters long"],
    // maxlength: [30, "Username cannot exceed 30 characters"],
    // // match: [
    // //   /^[a-zA-Z0-9_]+$/,
    // //   "Username can only contain letters, numbers and underscores",
    // // ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
    // minlength: [8, "Password must be at least 8 characters long"],
  },

  role: {
    type: String,
    enum: ["Admin", "Manager", "Employee"],
    default: "Employee",
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
