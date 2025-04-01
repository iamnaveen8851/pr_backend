const commentModel = require("../../models/commentModel");
const notificationModel = require("../../models/notificationModel");
const taskModel = require("../../models/taskModel");

const createComment = async (req, res) => {
  try {
    const { content, taskId, projectId, attachments } = req.body;
    const userId = req.user.userId;

    // Create the comment
    const newComment = new commentModel({
      content,
      author: userId,
      task: taskId || null,
      project: projectId || null,
      attachments: attachments || [],
    });

    await newComment.save();
    // await commentModel.create({
    //   content,
    //     author: userId,
    //     task: taskId || null,
    //     project: projectId || null,
    //     attachments: attachments || [],
    // });

    // Get the socket.io instance
    const io = req.app.get("io");

    if (!io) {
      console.error("Socket.io instance not available");
      return res.status(500).json({ message: "Socket.io instance not available" });
    }

    // Create notifications for task assignee if commenting on a task
    if (taskId) {
      const task = await taskModel.findById(taskId).populate("assignedTo");

      if (
        task &&
        task.assignedTo &&
        task.assignedTo._id.toString() !== userId
      ) {
        const notification = new notificationModel({
          recipient: task.assignedTo._id,
          sender: userId,
          type: "comment",
          task: taskId,
          message: `New comment on task: ${task.title}`,
        });

        await notification.save();

        // Check if io exists and emit notification
        if (io) {
          // Make sure we have a valid recipient ID
          const recipientId = task.assignedTo._id.toString();
          console.log("Emitting notification to:", recipientId);
          
          // Emit the notification
          io.to(recipientId).emit("new-notification", {
            notification: await notification.populate("sender", "username"),
          });
        } else {
          console.log("Socket.io instance not available");
        }
      }
    }

    // Emit the comment to the appropriate room
    const roomId = taskId || projectId;
    if (roomId) {
      io.to(roomId.toString()).emit("new-comment", {
        comment: await newComment.populate("author", "username"),
      });
    }

    res.status(201).json({
      message: "Comment created successfully",
      data: await newComment.populate("author", "username"),
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = createComment;
