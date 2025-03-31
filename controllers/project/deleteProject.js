const projectModel = require("../../models/projectModel");
const taskModel = require("../../models/taskModel");

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectModel.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only allow the project creator or admin to delete it
    if (
      project.createdBy.toString() !== req.user.userId &&
      req.user.role !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    // Delete all tasks associated with this project
    await taskModel.deleteMany({ project: id });

    // Delete the project
    await projectModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project and associated tasks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteProject;
