const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  startTimeTracking,
  stopTimeTracking,
  getUserTimeEntries,
} = require("../controllers/timeTracking/timeTracking");
const timeTrackingRouter = Router();

timeTrackingRouter.post(
  "/tasks/:taskId/start",
  authMiddleware,
  startTimeTracking
);

timeTrackingRouter.patch(
  "/entries/:entryId/stop",
  authMiddleware,
  stopTimeTracking
);

timeTrackingRouter.get("/entries", authMiddleware, getUserTimeEntries);

timeTrackingRouter.get(
  "/entries/user/:userId",
  authMiddleware,
  getUserTimeEntries
);

module.exports = timeTrackingRouter;
