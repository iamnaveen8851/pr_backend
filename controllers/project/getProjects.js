const projectModel = require("../../models/projectModel");

const getProjects = async (req, res) => {
  try {
    const projects = await projectModel
      .find()
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
