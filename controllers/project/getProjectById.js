const projectModel = require("../../models/projectModel");
const taskModel = require("../../models/taskModel");

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectModel
      .findById(id)
      .populate("createdBy", "username")
      .populate("manager", "username")
      .populate("team", "username");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get tasks associated with this project
    const tasks = await taskModel
      .find({ project: id })
      .populate("assignedTo", "username")
      .populate("assignedBy", "username")
      .populate("createdBy", "username");

    res.status(200).json({
      message: "Project fetched successfully",
      data: { project, tasks },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getProjectById;
