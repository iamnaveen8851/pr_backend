const userModel = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    res.status(200).json({ message: "All users found", users });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error: " + error.message);
  }
}

module.exports = getUsers;



