const taskModel = require("../../models/taskModel");
const aiService = require("../../utils/aiService");

const getTaskPriorityRecommendation = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get the task
    const task = await taskModel
      .findById(taskId)
      .populate("assignedTo", "username role");
    // console.log(task, "task");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get user's tasks
    const userTasks = await taskModel.find({
      assignedTo: task.assignedTo?._id,
    });

    // Get All tasks
    const allTasks = await taskModel.find();

    // Get AI recommendation
    const recommendation = await aiService.getTaskPriorityRecommendation(
      task,
      userTasks,
      allTasks
    );

    res.status(200).json({
      message: "AI priority recommendation generated",
      data: recommendation,
    });
  } catch (error) {
    console.log("Error getting AI recommendation:", error);
    res.status(500).json({ message: error.message });
  }
};

// Calculate priority based on deadline
const calculatePriority = (deadline) => {
  if (!deadline) return "Low"; // No deadline, default to Low
  const daysLeft = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft <= 1) return "High"; // if 1 day or less left, High priority
  if (daysLeft <= 3) return "Medium"; // if 3 days or less left, Medium priority
  return "Low";
};

const applyAiPriority = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get the task
    const task = await taskModel.findById(taskId);

    // console.log("task.......", task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Set initial priority based on deadline before AI processes it
    const initialPriority = calculatePriority(task.deadline);
    task.priority = initialPriority;

    // Get user's tasks
    const userTasks = await taskModel.find({
      assignedTo: task.assignedTo?._id,
    });

    // Get All tasks
    const allTasks = await taskModel.find();

    // Get AI recommendation
    const recommendation = await aiService.getTaskPriorityRecommendation(
      task,
      userTasks,
      allTasks
    );

    // update the task with AI recommendation
    task.priority = recommendation.recommendedPriority;
    task.aiRecommendation = {
      priority: recommendation.recommendedPriority,
      explanation: recommendation.explanation,
      confidenceScore: recommendation.confidenceScore,
      timeStamps: new Date(),
    };

    // save the task with updated AI recommendation
    await task.save();

    res.status(200).json({
      message: "AI priority applied successfully",
      priority: task.priority,
    });
  } catch (error) {
    console.log("Error applying AI priority:", error);
    res.status(500).json({ message: error.message });
  }
};

// Analyze task patterns
const analyzeTaskPatterns = async (req, res) => {
  try {
    // Get all Tasks
    const tasks = await taskModel
      .find()
      .populate("assignedTo", "username role");

    // Get AI analysis
    const analysis = await aiService.analyzeTaskPatterns(tasks);

    res.status(200).json({
      message: "Task pattern analysis completed",
      data: analysis,
    });
  } catch (error) {
    console.log("Error analyzing task patterns:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTaskPriorityRecommendation,
  applyAiPriority,
  analyzeTaskPatterns,
};
