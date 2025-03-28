const userModel = require("../../models/userModel");

const bcrypt = require("bcrypt");
const generateToken = require("../../lib/jwtToken");

require("dotenv").config();

const signup = async (req, res) => {
  console.log("signup route triggered", req.body);
  const { username, email, password, role } = req.body;
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
        role,
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

      res.status(201).json({
        message: "User created successfully",
        user: newUser,
        accessToken: token,
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = signup;
