const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const login = async (req, res) => {
  console.log("login route triggered", req.body);

  const { email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!password) {
      res.status(401).json({ message: "Password is required" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    var token = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res
      .cookie("jwtToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 2 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        data: existingUser,
        user: existingUser.username,
        accessToken: token,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = login;
