const taskModel = require("../../models/taskModel");
const timeEntryModel = require("../../models/timeEntryModel");
const { getIO } = require("../../utils/socket");

const startTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    console.log(userId, "userId");

    // check if task exists based on taskId
    const task = await taskModel.findById(taskId);

    // check if the task is not found in the database
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if there's already an active time entry for this user
    const activeEntry = await timeEntryModel.findOne({
      user: userId,
      isActive: true,
    });

    // if there is an active entry, return an message stating that the user already has an active time entry
    if (activeEntry) {
      return res.status(403).json({
        message: "You already have an active time entry. Please stop it first.",
        activeEntry,
      });
    }

    // Create a new time entry with explicit user ID
    const newTimeEntry = new timeEntryModel({
      task: taskId,
      user: userId,
      startTime: new Date(),
      isActive: true,
    });

    await newTimeEntry.save();

    // Update task with last time entry
    task.lastTimeEntry = newTimeEntry._id;
    await task.save();

    // Return the populated time entry
    const populatedEntry = await timeEntryModel
      .findById(newTimeEntry._id)
      .populate("task", "title description priority status project")
      .populate("user", "username email");

    // Emit socket event for live updates
    const io = getIO();
    io.to(task.project.toString()).emit("time-tracking-started", {
      timeEntry: populatedEntry,
      taskId: taskId,
      userId: userId,
    });

    res.status(201).json({
      message: "Time tracking started successfully",
      data: populatedEntry,
    });
  } catch (error) {
    console.log("Error starting time tracking: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const stopTimeTracking = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.userId;

    // find the active time entry
    const activeTimeEntry = await timeEntryModel.findOne({
      _id: entryId,
      user: userId,
      isActive: true,
    });

    console.log(activeTimeEntry, "activeTimeEntry");
    // check if the active time entry is not found in the database
    if (!activeTimeEntry) {
      return res.status(404).json({
        message: "Active time entry not found",
      });
    }

    // Update the time entry
    activeTimeEntry.endTime = new Date();
    activeTimeEntry.isActive = false;

    // Calculate duration in minutes
    const startTime = new Date(activeTimeEntry.startTime);
    const endTime = new Date(activeTimeEntry.endTime);
    const durationInMinutes = Math.round((endTime - startTime) / (1000 * 60));
    activeTimeEntry.duration = durationInMinutes;

    await activeTimeEntry.save();

    // Update task's actual time spent
    const task = await taskModel.findById(activeTimeEntry.task);

    if (task) {
      task.actualTimeSpent =
        (task.actualTimeSpent || 0) + activeTimeEntry.duration;
      await task.save();

      // Emit socket event for live updates
      const io = getIO();
      io.to(task.project.toString()).emit("time-tracking-stopped", {
        timeEntry: activeTimeEntry,
        taskId: task._id,
        userId: userId,
        totalTimeSpent: task.actualTimeSpent,
      });
    }

    res.status(200).json({
      message: "Time tracking stopped successfully",
      data: activeTimeEntry,
    });
  } catch (error) {
    console.log("Error stopping time tracking:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserTimeEntries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const { startDate, endDate, taskId, projectId } = req.query;

    const query = { user: userId };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (taskId) {
      query.task = taskId;
    }

    // If projectId is provided, first get all tasks in the project
    if (projectId) {
      const tasks = await taskModel.find({ project: projectId }).select("_id");

      const taskIds = tasks.map((task) => task._id);

      query.task = { $in: taskIds }; // check this once while testing if you get any error
    }

    const timeEntries = await timeEntryModel
      .find(query)
      .populate("task", "title description priority status project")
      .populate("user", "username email")
      .sort({ startTime: -1 });

    res.status(200).json({
      message: "Time entries retrieved successfully",
      data: timeEntries,
    });
  } catch (error) {
    console.log("Error getting user time entries:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startTimeTracking,
  stopTimeTracking,
  getUserTimeEntries,
};
