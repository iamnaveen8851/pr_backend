const taskModel = require("../../models/taskModel");

const getTask = async (req, res) => {
  try {
    const allTasks = await taskModel.find();
    res
      .status(200)
      .json({ message: "All tasks data have been fetched!", data: allTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error fetching tasks", error);
  }
};

module.exports = getTask;
