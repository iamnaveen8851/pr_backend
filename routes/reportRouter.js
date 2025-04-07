const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  generateTimeSpentReport,
  generatePendingTasksReport,
  generateTeamPerformanceReport,
} = require("../controllers/report/report");

const reportRouter = Router();

reportRouter.get(
  "/time-spent",
  authMiddleware,
  generateTimeSpentReport
);

reportRouter.get(
  "/pending-tasks",
  authMiddleware,
  generatePendingTasksReport
);

reportRouter.get(
  "/team-performance",
  authMiddleware,
  generateTeamPerformanceReport
);

module.exports = reportRouter;
