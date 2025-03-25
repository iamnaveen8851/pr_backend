const userModel = require("../../models/userModel");

const getUsers = async (req, res) => {
  try {
    const AllUsers = await userModel.find();
    res
      .status(200)
      .json({ message: "All users data have been fetched!", data: AllUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error fetching users", error);
  }
};

module.exports = getUsers;
