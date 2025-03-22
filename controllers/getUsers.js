const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const getUserByToken = async (req, res) => {
  try {
    const token = req.cookies.jwtToken;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await userModel.findById(decoded.userId).select("-password");

    // res.json(user);

    res.status(200).json({ message: "User found", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error: " + error.message);
  }
};

module.exports = getUserByToken;
