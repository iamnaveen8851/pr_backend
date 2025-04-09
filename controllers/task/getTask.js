const taskModel = require("../../models/taskModel");

const getTask = async (req, res) => {
  try {
    // First, let's check if the project field exists in any tasks
    const taskWithProject = await taskModel.findOne({
      project: { $exists: true, $ne: null },
    });
    console.log("Task with project field:", taskWithProject);
    const userId = req.user.userId;
    const allTasks = await taskModel
      .find
      // {createdBy: userId,}
      ()
      .populate("assignedTo", "username role")
      .populate("assignedBy", "username role")
      .populate("project", "name description")
      .populate("createdBy", "username role");

    // Log the first task to see its structure
    if (allTasks.length > 0) {
      console.log("First task:", JSON.stringify(allTasks[0], null, 2));
    }

    res
      .status(200)
      .json({ message: "All tasks data have been fetched!", data: allTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error fetching tasks", error);
  }
};

module.exports = getTask;
