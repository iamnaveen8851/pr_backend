const projectModel = require("../../models/projectModel");

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await projectModel.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only allow the project creator or manager to update it
    if (
      project.createdBy.toString() !== req.user.userId &&
      project.manager.toString() !== req.user.userId &&
      req.user.role !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    const updatedProject = await projectModel
      .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("createdBy", "username")
      .populate("manager", "username")
      .populate("team", "username");

    res.status(200).json({
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateProject;
