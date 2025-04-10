const performanceMetricModel = require("../../models/performanceMetricModel");
const taskModel = require("../../models/taskModel");
const userModel = require("../../models/userModel");
// const { getTaskAllocationRecommendations } = require("../../utils/aiService");
const { getTaskAllocationRecommendations } = require("../../utils/aiService");

const getTaskAllocation = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get the single task
    const task = await taskModel.findById(taskId);

    // check if the task is found or not
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get all eligible users (based on role, etc.)
    const eligibleUsers = await userModel.find({
      role: { $in: ["Employee", "Manager"] },
    });

    // Get performance metrics for all users
    const performanceMetrics = await performanceMetricModel.find({
      user: { $in: eligibleUsers.map((user) => user._id) },
    });

    // Get current workload for all users
    const userWorkloads = await taskModel.aggregate([
      {
        $match: {
          assignedTo: { $in: eligibleUsers.map((user) => user._id) },
          status: { $nin: ["Completed"] },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          activeTasks: { $sum: 1 },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] },
          },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    // Prepare data for AI service
    // Prepare data for AI service
    const userData = eligibleUsers.map((user) => {

      const metrics =
        performanceMetrics.find(
          (m) => m.user.toString() === user._id.toString()
        ) || {};
      const workload = userWorkloads.find(
        // check do we need to create userWorkloads as model
        (w) => w._id.toString() === user._id.toString()
      ) || {
        activeTasks: 0,
        highPriorityTasks: 0,
        totalEstimatedTime: 0,
      };

      return {
        userId: user._id,
        username: user.username,
        role: user.role,
        metrics: {
          averageCompletionTime: metrics.averageCompletionTime || 0,
          tasksCompleted: metrics.tasksCompleted || 0,
          onTimeCompletion: metrics.onTimeCompletion || 0,
          skillRating: metrics.skillRating || 5,
          strengths: metrics.strengths || [],
        },
        workload: {
          activeTasks: workload.activeTasks,
          highPriorityTasks: workload.highPriorityTasks,
          totalEstimatedTime: workload.totalEstimatedTime,
        },
      };
    });

    // Get AI recommendation
    const recommendations = await getTaskAllocationRecommendations(
      task,
      userData
    );

    res.status(200).json({
      message: "Task allocation recommendations generated",
      data: recommendations,
    });
  } catch (error) {
    console.log("Error getting task allocation recommendations:", error);
    res.status(500).json({ message: error.message });
  }
};

const applyTaskAllocation = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body; // check this once while making post request

    // validate inputs
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get the single Task
    const task = await taskModel.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Get the user
    const user = userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update the task
    task.assignedTo = userId;
    task.assignedBy = req.user._id;
    await task.save();

    res.status(200).json({
      message: "Task allocation applied successfully",
      data: task,
    });
  } catch (error) {
    console.log("Error applying task allocation.", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  //   getTaskAllocationRecommendations,
  getTaskAllocation,
  applyTaskAllocation,
};
