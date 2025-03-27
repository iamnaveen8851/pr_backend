const taskModel = require("../../models/taskModel");

const createTask = async (req, res) => {
  const {
    title,
    description,
    priority,
    status,
    assignedTo,
    assignedBy,
    // dependencies,
    estimatedTime,
    deadline,
    createdBy,
  } = req.body;
  try {
    const newTask = new taskModel({
      title,
      description,
      priority,
      status,
      assignedTo,
      assignedBy,
      estimatedTime,
      deadline,
      createdBy: req.user.userId,
    });

    await newTask.save();
    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};

module.exports = createTask;
