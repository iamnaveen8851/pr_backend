const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed"],
      default: "Planning",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    workflow: {
      type: [
        {
          name: String,
          order: Number,
        },
      ],
      default: [
        { name: "Pending", order: 1 },
        { name: "In Progress", order: 2 },
        { name: "Review", order: 3 },
        { name: "Completed", order: 4 },
      ],
    },
  },
  { timestamps: true }
);

const projectModel = mongoose.model("projects", projectSchema);

module.exports = projectModel;
