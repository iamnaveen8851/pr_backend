const mongoose = require("mongoose");

const performanceMetricSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    taskType: {
      type: String,
      default: "General",
    },

    averageCompletionTime: {
      type: Number,
      default: 0,
    },

    taskCompleted: {
      type: Number,
      default: 0,
    },

    onTimeCompletion: {
      type: Number,
      default: 0,
    },

    skillRating: {
      type: Number,
      default: 5,
    },

    strengths: [String],

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const performanceMetricModel = mongoose.model(
  "performanceMetrics",
  performanceMetricSchema
);

module.exports = performanceMetricModel;
