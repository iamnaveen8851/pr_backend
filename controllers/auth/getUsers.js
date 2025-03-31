const userModel = require("../../models/userModel");

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    // If role query parameter is provided, filter users by role
    const filter = role ? { role } : {};
    const AllUsers = await userModel.find(filter);
    res
      .status(200)
      .json({ message: "All users data have been fetched!", data: AllUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error fetching users", error);
  }
};

module.exports = getUsers;
