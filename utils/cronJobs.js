var cron = require("node-cron");
const taskModel = require("../models/taskModel");
const timeEntryModel = require("../models/timeEntryModel");
const performanceMetricModel = require("../models/performanceMetricModel");

const updatePerformanceMetrics = cron.schedule("0 0 * * *", async () => {
  try {
    console.log("running performance metrics update...");

    // Get all users who have completed tasks
    const users = await taskModel.distinct("assignedTo", {
      status: "Completed",
    });

    for (const userId of users) {
      // skip if the userId is null

      const completedTasks = await taskModel.find({
        assignedTo: userId,
        status: "Completed",
      });

      // Get time entries for these tasks
      const taskIds = completedTasks.map((task) => task._id);

      const timeEntries = await timeEntryModel.find({
        task: { $in: taskIds },
        user: userId,
      });

      // Calculate metrics
      const tasksCompleted = completedTasks.length;

      // Calculate on-time completion rate
      let tasksCompletedOnTime = 0;

      completedTasks.forEach((task) => {
        const deadline = new Date(task.deadline);
        const completedDate = new Date(task.updatedAt);

        if (completedDate <= deadline) {
          tasksCompletedOnTime++;
        }
      });

      const onTimeCompletion =
        tasksCompleted > 0 ? (tasksCompletedOnTime / taskCompleted) * 100 : 0;

      // Calculate average  completion time
      let totalEstimatedTime = 0;
      let totalActualTime = 0;

      completedTasks.forEach((task) => {
        totalEstimatedTime += task.estimatedTime || 0;

        // Get actual time from time entries
        const taskEntries = timeEntries.filter(
          (entry) => entry.task.toString() === task._id.toString()
        );

        const actualTime = taskEntries.reduce(
          (total, entry) => total(entry.duration || 0),
          0
        );

        totalActualTime += actualTime;
      });

      const averageCompletionTime =
        tasksCompleted > 0 ? totalActualTime / taskCompleted : 0;

      // Calculate skill rating (simple algorithm - can be improved)
      const efficiency =
        totalEstimatedTime > 0
          ? (totalEstimatedTime * 60) / totalActualTime // convert estimated hours to minutes
          : 1;

      const skillRating = Math.min(
        10,
        Math.max(
          1,
          Math.round(
            efficiency * 0.4 + onTimeCompletion / 10 + tasksCompleted / 10
          )
        )
      );

      // Update or create performance metric
      await performanceMetricModel.findOneAndUpdate(
        { user: userId },
        {
          tasksCompleted,
          onTimeCompletion,
          averageCompletionTime,
          skillRating,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true } // here upsert used to update the document if exists, if not then it will insert that document
      );
    }

    console.log("Performance metrics update completed");
  } catch (error) {
    console.log("Error updating performance metrics:", error);
  }
});

module.exports = updatePerformanceMetrics;
