const projectModel = require("../../models/projectModel");

const getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await projectModel
      .find({ $or: [{ team: userId }, { manager: userId }] })
      .populate("createdBy", "username")
      .populate("manager", "username")
      .populate("team", "username");

    res.status(200).json({
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getProjects;
