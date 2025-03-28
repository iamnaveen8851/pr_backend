const { Router } = require("express");
const getTask = require("../controllers/task/getTask");
const createTask = require("../controllers/task/createTask");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const updateTask = require("../controllers/task/updateTask");
const deleteTask = require("../controllers/task/deleteTask");

const taskRouter = Router();

taskRouter.get(
  "/",
  authMiddleware,
  authorizeRoles("Admin", "Manager", "Employee"),
  getTask
);

taskRouter.post(
  "/createTask",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  createTask
);

<<<<<<< Updated upstream

=======
// updateTask
>>>>>>> Stashed changes
taskRouter.patch(
  "/updateTask/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  updateTask
);

// deleteTask
taskRouter.delete(
  "/deleteTask/:id",
  authMiddleware,
  authorizeRoles("Admin", "Manager"),
  deleteTask
);
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes

module.exports = taskRouter;
