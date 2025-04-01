const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const getNotifications = require("../controllers/notification/getNotifications");
const markAsRead = require("../controllers/notification/markAsRead");

const notificationRouter = Router();

notificationRouter.get("/", authMiddleware, getNotifications);

notificationRouter.patch("/:notificationId/read", authMiddleware, markAsRead);

module.exports = notificationRouter;


