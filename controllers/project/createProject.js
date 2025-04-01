const projectModel = require("../../models/projectModel");
const notificationModel = require("../../models/notificationModel"); // Add this import

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

    // Create notifications for team members
    if (newProject.team && newProject.team.length > 0) {
      const teamNotifications = newProject.team.map((userId) => ({
        recipient: userId,
        sender: req.user.userId,
        type: "project",
        project: newProject._id,
        message: `You have been added to a new project: ${newProject.name}`,
      }));
      
      console.log(teamNotifications, "Team notifications");
      await notificationModel.insertMany(teamNotifications);
    }

    // Create notification for the manager if different from creator
    if (newProject.manager.toString() !== req.user.userId) {
      const managerNotification = new notificationModel({
        recipient: newProject.manager,
        sender: req.user.userId,
        type: "project_manager",
        project: newProject._id,
        message: `You have been assigned as manager to project: ${newProject.name}`,
      });
      
      await managerNotification.save();
    }

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