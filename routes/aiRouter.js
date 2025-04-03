const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getTaskPriorityRecommendation,
  applyAiPriority,
  analyzeTaskPatterns,
} = require("../controllers/openai/taskAiController");
const aiRouter = Router();

aiRouter.get(
  "/tasks/:taskId/priority-recommendation",
  authMiddleware,
  getTaskPriorityRecommendation
);

aiRouter.post("/tasks/:taskId/apply-priority", authMiddleware, applyAiPriority);

aiRouter.get("/tasks/analyze-patterns", authMiddleware, analyzeTaskPatterns);

module.exports = aiRouter;
