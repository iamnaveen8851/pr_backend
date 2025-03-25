const taskModel = require("../../models/taskModel");

const deleteTask = async (req, res) => {
  const { id: taskId } = req.params;
  try {
    const deleteTask = await taskModel.findByIdAndDelete(taskId);
    res.status(200).json({
      message: "Task deleted successfully",
      deleteTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error While deleting task", error);
  }
};

module.exports = deleteTask;
