const projectModel = require("../../models/projectModel");

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      manager,
      team,
      workflow,
    } = req.body;

    const newProject = new projectModel({
      name,
      description,
      status,
      startDate,
      endDate,
      createdBy: req.user.userId,
      manager: manager || req.user.userId,
      team: team || [],
      workflow: workflow || undefined, // Use default if not provided
    });

    await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = createProject;