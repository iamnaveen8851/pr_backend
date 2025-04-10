const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Error setting up email:", error);
  } else {
    console.log("Server is ready to send emails", success);
  }
});

module.exports = { transporter }; // Export as an object
