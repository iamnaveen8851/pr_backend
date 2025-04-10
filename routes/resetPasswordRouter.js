const { Router } = require("express");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/auth/resetPassword");

const passwordReset = Router();

passwordReset.post("/forgot-password", forgotPassword);

passwordReset.post("/reset-password", resetPassword);

module.exports = passwordReset;


