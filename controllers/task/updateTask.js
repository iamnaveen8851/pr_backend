const taskModel = require("../../models/taskModel");

const updateTask = async (req, res) => {
  const { id: taskId } = req.params;

  try {
    const updatedTask = await taskModel.findByIdAndUpdate(taskId, req.body);
    res.status(200).json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error while updating task:", error);
  }
};

module.exports = updateTask;
