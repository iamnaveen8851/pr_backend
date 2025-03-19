const userModel = require("../models/userModel");

const bcrypt = require("bcrypt");
const generateToken = require("../lib/jwtToken");
const setCookies = require("../lib/setCookie");
require("dotenv").config();

const signup = async (req, res) => {
  console.log("signup triggered", req.body);
  const { username, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash the password
    bcrypt.hash(password, 10, async (err, hash) => {
      // Store hash in your password DB.
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      const newUser = new userModel({
        username,
        email,
        password: hash,
      });

      await newUser.save();

      //   assign token to the user by calling the function
      const token = await generateToken(
        {
          userId: newUser.userId,
          username: newUser.username,
        },
        process.env.JWT_SECRET
      );

   
      //setting cookies
      await setCookies(token, res);

      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = signup;
