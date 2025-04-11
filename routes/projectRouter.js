const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const createProject = require("../controllers/project/createProject");
const getProjects = require("../controllers/project/getProjects");
const getProjectById = require("../controllers/project/getProjectById");
const updateProject = require("../controllers/project/updateProject");
const deleteProject = require("../controllers/project/deleteProject");

const projectRouter = Router();

// Get all projects
projectRouter.get(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Manager", "Employee"),
  getProjects
);

// Get project by ID with its tasks
projectRouter.get(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager", "Employee"),
  getProjectById
);

// Create new project
projectRouter.post(
  "/createProject",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  createProject
);

// Update project
projectRouter.patch(
  "/updateProject/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  updateProject
);

// Delete project
projectRouter.delete(
  "/deleteProject/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  deleteProject
);

module.exports = projectRouter;
