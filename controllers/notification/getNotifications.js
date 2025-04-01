const notificationModel = require("../../models/notificationModel");
const mongoose = require("mongoose"); // Add this import

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID from request:", userId);

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log("User ObjectId:", userObjectId);

    // Check if there are any notifications for this user
    const count = await notificationModel.countDocuments({
      recipient: userObjectId,
    });
    console.log(`Found ${count} notifications for user ${userId}`);

    if (count === 0) {
      return res.status(404).json({ message: "No notifications found." });
    }

    const notifications = await notificationModel
      .find({ recipient: userObjectId })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("task", "title")
      .populate({
        path: "project",
        select: "name description status startDate endDate manager",
        populate: {
          path: "manager",
          select: "username email",
        },
      })
      .limit(50);

    console.log("Fetched Notifications:", notifications);

    res.status(200).json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
};



module.exports = getNotifications;
