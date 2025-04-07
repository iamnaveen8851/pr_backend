const taskModel = require("../../models/taskModel");
const timeEntryModel = require("../../models/timeEntryModel");
const mongoose = require("mongoose");
const userModel = require("../../models/userModel");

const generateTimeSpentReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, projectId } = req.query;
    console.log("Query params:", { startDate, endDate, userId, projectId });

    const match = {};

    if (startDate && endDate) {
      // Check if we're dealing with future dates (for testing)
      const currentDate = new Date();
      const requestStartDate = new Date(startDate);
      const requestEndDate = new Date(endDate);
      
      console.log("Current date:", currentDate);
      console.log("Request start date:", requestStartDate);
      console.log("Request end date:", requestEndDate);
      
      // Use the dates as provided in the request
      match.startTime = {
        $gte: requestStartDate,
        $lte: requestEndDate,
      };
      
      // For debugging, let's also log all time entries for this user
      if (userId) {
        const allUserEntries = await timeEntryModel.find({ 
          user: new mongoose.Types.ObjectId(userId) 
        });
        console.log(`Total time entries for user: ${allUserEntries.length}`);
        if (allUserEntries.length > 0) {
          console.log("Sample entry startTime:", allUserEntries[0].startTime);
        }
      }
    }

    if (userId) {
      match.user = new mongoose.Types.ObjectId(userId);
    }

    if (projectId) {
      // First get all tasks in the project
      const tasks = await taskModel.find({ project: projectId }).select("_id");
      const taskIds = tasks.map((task) => task._id);
      match.task = { $in: taskIds };
    }

    console.log("Match criteria:", JSON.stringify(match));

    // Fetch time entries with the specified filters
    const timeEntries = await timeEntryModel.find(match)
      .populate({
        path: "task",
        select: "title status priority"
      })
      .populate({
        path: "user",
        select: "username"
      });

    console.log(`Found ${timeEntries.length} time entries`);

    // If no entries found, return empty array
    if (timeEntries.length === 0) {
      return res.status(200).json({
        message: "Time spent report generated successfully",
        data: []
      });
    }

    // Process time entries to calculate duration from startTime and endTime
    const processedEntries = timeEntries.map(entry => {
      let calculatedDuration = 0;
      
      if (entry.startTime) {
        const startTime = new Date(entry.startTime);
        
        // If endTime exists, use it; otherwise use current time for ongoing entries
        const endTime = entry.endTime ? new Date(entry.endTime) : new Date();
        
        calculatedDuration = (endTime - startTime) / (1000 * 60); // Convert ms to minutes
        console.log(`Entry ${entry._id}: Duration calculated as ${calculatedDuration} minutes`);
      } else {
        console.log(`Entry ${entry._id}: Missing startTime`);
      }
      
      return {
        ...entry.toObject(),
        calculatedDuration
      };
    });

    // Group by user and task
    const userTaskMap = {};
    processedEntries.forEach(entry => {
      // Check if user is available directly in the entry
      let userId, username;
      
      if (entry.user && typeof entry.user === 'object' && entry.user._id) {
        // User is populated
        userId = entry.user._id.toString();
        username = entry.user.username || 'Unknown Username';
      } else if (entry.user && typeof entry.user === 'string') {
        // User is not populated, just an ID
        userId = entry.user;
        username = 'User ' + userId.substring(0, 6);
      } else if (req.query.userId) {
        // If no user in entry but userId in query, use that
        userId = req.query.userId;
        username = 'User from Query';
      } else {
        // For entries without user field, use a default or the authenticated user
        userId = req.user ? req.user._id.toString() : 'unknown';
        username = req.user ? req.user.username : 'Unknown User';
      }
      
      // Similar check for task
      let taskId, taskTitle, taskStatus, taskPriority;
      
      if (entry.task && typeof entry.task === 'object' && entry.task._id) {
        // Task is populated
        taskId = entry.task._id.toString();
        taskTitle = entry.task.title || 'Unknown Title';
        taskStatus = entry.task.status || 'Unknown';
        taskPriority = entry.task.priority || 'Unknown';
      } else if (entry.task && typeof entry.task === 'string') {
        // Task is not populated, just an ID
        taskId = entry.task;
        taskTitle = 'Task ' + taskId.substring(0, 6);
        taskStatus = 'Unknown';
        taskPriority = 'Unknown';
      } else {
        taskId = 'unknown';
        taskTitle = 'Unknown Task';
        taskStatus = 'Unknown';
        taskPriority = 'Unknown';
      }
      
      console.log(`Processed entry - User: ${userId} (${username}), Task: ${taskId} (${taskTitle})`);
      
      const key = `${userId}-${taskId}`;
      
      if (!userTaskMap[key]) {
        userTaskMap[key] = {
          userId: userId,
          username: username,
          taskId: taskId,
          taskTitle: taskTitle,
          taskStatus: taskStatus,
          taskPriority: taskPriority,
          totalDuration: 0
        };
      }
      
      userTaskMap[key].totalDuration += entry.calculatedDuration;
      console.log(`Added ${entry.calculatedDuration} minutes to ${key}, total now: ${userTaskMap[key].totalDuration}`);
    });

    console.log(`Created ${Object.keys(userTaskMap).length} user-task groups`);

    // Group by user
    const userMap = {};
    Object.values(userTaskMap).forEach(item => {
      const userId = item.userId.toString();
      
      if (!userMap[userId]) {
        userMap[userId] = {
          userId: item.userId,
          username: item.username,
          tasks: [],
          totalDuration: 0
        };
      }
      
      userMap[userId].tasks.push({
        taskId: item.taskId,
        title: item.taskTitle,
        status: item.taskStatus,
        priority: item.taskPriority,
        totalDuration: parseFloat((item.totalDuration / 60).toFixed(2)) // Convert to hours with 2 decimal places
      });
      
      userMap[userId].totalDuration += item.totalDuration;
    });
    
    // Format the final report
    const timeReport = Object.values(userMap).map(user => ({
      userId: user.userId,
      username: user.username,
      totalDuration: parseFloat((user.totalDuration / 60).toFixed(2)), // Convert to hours with 2 decimal places
      tasks: user.tasks
    }));

    console.log(`Final report contains data for ${timeReport.length} users`);

    res.status(200).json({
      message: "Time spent report generated successfully",
      data: timeReport,
    });
  } catch (error) {
    console.log("Error generating time spent report:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate pending tasks report
const generatePendingTasksReport = async (req, res) => {
  try {
    const { userId, projectId } = req.query;

    const match = {
      status: { $nin: ["Completed"] },
    };

    if (userId) {
      match.assignedTo = mongoose.Types.ObjectId(userId);
    }

    if (projectId) {
      match.project = mongoose.Types.ObjectId(projectId);
    }

    const pendingTasks = await taskModel
      .find(match)
      .populate("assignedTo", "username email")
      .populate("assignedBy", "username email")
      .populate("project", "name")
      .sort({ deadline: 1 });

    // Group by user
    const userGroups = {};
    pendingTasks.forEach((task) => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        if (!userGroups[userId]) {
          userGroups[userId] = {
            userId,
            username: task.assignedTo.username,
            tasks: [],
            totalTasks: 0,
            highPriorityTasks: 0,
          };
        }

        userGroups[userId].tasks.push(task);
        userGroups[userId].totalTasks++;
        if (task.priority === "High") {
          userGroups[userId].highPriorityTasks++;
        }
      }
    });

    const report = Object.values(userGroups);

    res.status(200).json({
      message: "Pending tasks report generated successfully",
      data: report,
    });
  } catch (error) {
    console.log("Error generating pending tasks report:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate team performance report
const generateTeamPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;

    // Get all completed tasks in the date range
    const match = {
      status: "Completed",
    };

    if (startDate && endDate) {
      match.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (projectId) {
      match.project = new mongoose.Types.ObjectId(projectId);
    }

    const completedTasks = await taskModel
      .find(match)
      .populate("assignedTo", "username email")
      .sort({ updatedAt: -1 });

    // console.log(completedTasks, "completedTasks");

    //    Get the task ids from the completed tasks array
    const taskIds = completedTasks.map((task) => task._id);

    const timeEntries = await timeEntryModel.find({
      task: { $in: taskIds },
    });

    console.log("timeEntries", timeEntries);
    // Calculate performance metrics
    const userPerformance = {};

    completedTasks.forEach((task) => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        console.log("userId============ ", userId);

        if (!userPerformance[userId]) {
          userPerformance[userId] = {
            userId,
            username: task.assignedTo.username,
            tasksCompleted: 0,
            onTimeCompletion: 0,
            tasksCompletedOnTime: 0,
            totalEstimatedTime: 0,
            totalActualTime: 0,
            efficiency: 0,
          };
        }

        userPerformance[userId].tasksCompleted++;

        // Check if task was completed on time
        const deadline = new Date(task.deadline);
        const completedDate = new Date(task.updatedAt);
        if (completedDate <= deadline) {
          userPerformance[userId].tasksCompletedOnTime++;
        }

        // Add estimated time
        // Convert estimatedTime to hours if it's in minutes, or use 0 if not set
        userPerformance[userId].totalEstimatedTime += task.estimatedTime
          ? task.estimatedTime / 60
          : 0;

        // Calculate actual time from time entries
        const taskEntries = timeEntries.filter((entry) => {
          const entryTaskId = entry.task.toString();
          const taskId = task._id.toString();

          // Only filter by task ID, not by user
          return entryTaskId === taskId;
        });

        // Log the entries found for debugging
        console.log(
          `Found ${taskEntries.length} time entries for task ${task.title}`
        );

        // Calculate actual time by computing duration from startTime and endTime
        const actualTime =
          taskEntries.reduce((total, entry) => {
            // If duration is already set and non-zero, use it
            if (entry.duration && entry.duration > 0) {
              return total + entry.duration;
            }

            // Otherwise calculate from startTime and endTime
            if (entry.startTime && entry.endTime) {
              const startTime = new Date(entry.startTime);
              const endTime = new Date(entry.endTime);
              const durationInMinutes = (endTime - startTime) / (1000 * 60); // Convert ms to minutes
              console.log(`Calculated duration: ${durationInMinutes} minutes`);
              return total + durationInMinutes;
            }

            return total;
          }, 0) / 60; // Convert to hours

        console.log(
          `Total actual time for task ${task.title}: ${actualTime} hours`
        );
        userPerformance[userId].totalActualTime += actualTime;
      }
    });

    // Calculate final metrics
    Object.values(userPerformance).forEach((user) => {
      // Format totalEstimatedTime and totalActualTime to 2 decimal places
      user.totalEstimatedTime = parseFloat(user.totalEstimatedTime.toFixed(2));
      user.totalActualTime = parseFloat(user.totalActualTime.toFixed(2));
      
      user.onTimeCompletion = Math.round(
        user.tasksCompleted > 0
          ? (user.tasksCompletedOnTime / user.tasksCompleted) * 100
          : 0
      );
  
      // Prevent division by zero
      if (user.totalActualTime === 0) {
        user.efficiency = 0;
      } else {
        user.efficiency = Math.round(
          user.totalEstimatedTime > 0
            ? (user.totalEstimatedTime / user.totalActualTime) * 100
            : 0
        );
      }
    });

    const report = Object.values(userPerformance);

    res.status(200).json({
      message: "Team performance report generated successfully",
      data: report,
    });
  } catch (error) {
    console.log("Error generating team performance report:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateTimeSpentReport,
  generatePendingTasksReport,
  generateTeamPerformanceReport,
};
