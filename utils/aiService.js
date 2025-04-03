const { OpenAI } = require("openai");
require("dotenv").config();

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get task priority recommendation based on task details and historical data
 * @param {Object} task - The task object
 * @param {Array} userTasks - Historical data about user's tasks
 * @param {Array} allTasks - All tasks in the system
 * @returns {Object} - Priority recommendation and explanation
 */
const getTaskPriorityRecommendation = async (task, userTasks, allTasks) => {
  try {
    const deadlineProximity = task.deadline
      ? Math.ceil(
          (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const userActiveTasksCount = userTasks.filter(
      (t) => t.status !== "Completed" && t.status !== "Cancelled"
    ).length;

    const prompt = `
      You are an AI task prioritization assistant. Your job is to analyze task details and assign an appropriate priority level.
      
      Task Details:
      - Title: ${task.title}
      - Description: ${task.description || "None"}
      - Estimated Time: ${task.estimatedTime || "Not specified"} hours
      - Deadline: ${
        task.deadline
          ? new Date(task.deadline).toISOString().split("T")[0]
          : "None"
      }
      - Days until deadline: ${
        deadlineProximity !== null ? deadlineProximity : "No deadline set"
      }
      
      Instructions:
      - If the deadline is within 24 hours, set the priority to "High".
      - If the estimated time is greater than 4 hours but the deadline is more than a day away, set the priority to "Medium".
      - If the deadline is more than 3 days away and the estimated time is less than or equal to 2 hours, set the priority to "Low".
      - Otherwise, set the priority based on urgency and effort required.
      
      Response Format (JSON only):
      {
        "recommendedPriority": "High/Medium/Low"
      }
    `;

    const response = await openAi.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error getting AI recommendation:", error);
    return { recommendedPriority: "Medium" };
  }
};


/**
 * Learn from user feedback by comparing AI recommendation with user choice
 * @param {String} taskId - Task ID
 * @param {String} aiRecommendedPriority - AI recommended priority
 * @param {String} userSetPriority - User set priority
 */
const learnFromUserFeedback = async (taskId, aiRecommendedPriority, userSetPriority) => {
  // In a production system, you would store this data for model improvement
  console.log(`Learning from feedback: Task ${taskId}, AI: ${aiRecommendedPriority}, User: ${userSetPriority}`);
  
  // You could store this data in a separate collection for later analysis
  // For now, we'll just log it
};

/**
 * Analyze task patterns to identify trends
 * @param {Array} tasks - Array of tasks
 * @returns {Object} - Analysis results
 */
const analyzeTaskPatterns = async (tasks) => {
  try {
    // Extract key information from tasks
    const taskData = tasks.map(task => ({
      title: task.title,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?.username,
      estimatedTime: task.estimatedTime,
      deadline: task.deadline
    }));

    // Prepare the prompt
    const prompt = `
    Analyze the following task data and identify patterns or trends:
    ${JSON.stringify(taskData, null, 2)}
    
    Please provide insights on:
    1. Task distribution by priority and status
    2. User workload patterns
    3. Deadline and time estimation patterns
    4. Any recommendations for improving task management
    
    Return your analysis in JSON format:
    {
      "priorityDistribution": { summary of priority distribution },
      "statusDistribution": { summary of status distribution },
      "workloadInsights": { insights about user workloads },
      "timeManagementInsights": { insights about deadlines and time estimates },
      "recommendations": [ array of recommendations ]
    }
    `;

    // Call OpenAI API
    const response = await openAi.chat.completions.create({
      model: "gpt-4", // Changed from gpt-3.5-turbo to gpt-4
      messages: [
        { role: "system", content: "You are an AI task analysis assistant. Your job is to analyze task data and identify patterns and insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error analyzing task patterns:", error);
    return {
      error: error.message,
      message: "Unable to analyze task patterns"
    };
  }
};

module.exports = {
  getTaskPriorityRecommendation,
  learnFromUserFeedback,
  analyzeTaskPatterns
};

