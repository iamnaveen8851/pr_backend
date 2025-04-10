const crypto = require("crypto");
const { transporter } = require("../../utils/emailConfig");
const userModel = require("../../models/userModel");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { log } = require("console");

// Forgot password route function
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // console.log("Reset Token:", resetToken);

    // Set token and expiration (1 hour from now)
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await existingUser.save();

    // Create reset URL
    /* const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;*/

    const resetUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.PRO_URL}/reset-password/${resetToken}`
        : `${process.env.DEV_URL}/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: existingUser.email,
      subject: "Password Reset Request",
      html: `
        <h1>You requested a password reset</h1>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset email sent successfully.",
      resetToken: existingUser.resetPasswordToken,
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reset password route function
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token and check if token is still valid
    const existingUser = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!existingUser) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired",
      });
    }

    // hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // update the user's  password and clear reset token and expires fields
    existingUser.password = newHashedPassword;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordExpires = undefined;

    await existingUser.save();

    res.status(200).json({
      message: "Password has been reset successful.",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
