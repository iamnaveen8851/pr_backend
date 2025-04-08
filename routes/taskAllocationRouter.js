const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getTaskAllocation,
  applyTaskAllocation,
} = require("../controllers/taskAllocation/taskAllocation");
const authorizeRoles = require("../middlewares/authorizeRoles");

const taskAllocationRouter = Router();

taskAllocationRouter.get(
  "/:taskId/recommendations",
  authMiddleware,
  // authorizeRoles("Manager", "Admin"),
  getTaskAllocation
);

taskAllocationRouter.post(
  "/:taskId/allocate",
  authMiddleware,
  // authorizeRoles("Manager", "Admin"),
  applyTaskAllocation
);

module.exports = taskAllocationRouter;
