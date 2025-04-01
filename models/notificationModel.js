const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    type: {
      type: String,
      enum: ["comment", "assignment", "status_change", "deadline", "project"],
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },

    message: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("notifications", notificationSchema);

module.exports = notificationModel;
