const socketIo = require("socket.io");

let io;

const configureSocket = (server) => {
  io = socketIo(server, {
    cors: {
      // origin: "https://pr-frontend-one.vercel.app", // // PRO URL
      // origin: "https://pr-frontendtesting01.vercel.app", // new pro url
      origin: "http://localhost:5173", // DEV URL
      credentials: true, // enable set-cookie headers
    },
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a room for specific task or project
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Leave a room
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    });

    // Handle task updates
    socket.on("task-update", (data) => {
      socket.to(data.projectId).emit("task-updated", data);
      console.log(`Task update in project ${data.projectId}`, data);
    });

    // Handle time tracking updates
    socket.on("time-tracking-update", (data) => {
      socket.to(data.projectId).emit("time-tracking-updated", data);
      console.log(`Time tracking update in project ${data.projectId}`, data);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

// Function to get the io instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { configureSocket, getIO };
