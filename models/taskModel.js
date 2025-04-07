const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Review", "Completed"],
      default: "Pending",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true, // make it optional till you added in the ui
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false, //check this once api tested once Task allocation apply task allocation api tested
    },
    // Add this to your existing taskModel schema
    aiRecommendation: {
      priority: String,
      explanation: String,
      confidenceScore: Number,
      timestamp: Date,
    },

    // dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    estimatedTime: { type: Number, required: true }, // Estimated time in hours
    deadline: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // New fields for time tracking added in schema
    actualTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    lastTimeEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeEntry",
    },
  },
  { timestamps: true }
);

const taskModel = mongoose.model("tasks", taskSchema);

module.exports = taskModel;
