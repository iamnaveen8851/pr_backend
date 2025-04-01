const commentModel = require("../../models/commentModel");

const getComments = async (req, res) => {
  try {
    const { taskId, projectId } = req.query;

    if (!taskId && !projectId) {
      return res
        .status(400)
        .json({ message: "Task ID or Project ID is required" });
    }

    const filter = {};
    if (taskId) filter.task = taskId;
    if (projectId) filter.projectId = projectId;

    const comments = await commentModel
      .find(filter)
      .sort({ createdAt: 1 })
      .populate("author", "username email");

    res
      .status(200)
      .json({ message: "Comments fetched successfully", data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getComments;
