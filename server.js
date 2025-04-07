const express = require("express");
const connectDb = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const taskRouter = require("./routes/taskRouter");
const authRouter = require("./routes/authRouter");
const passport = require("./middlewares/passport");
const session = require("express-session");
const projectRouter = require("./routes/projectRouter");
const MongoStore = require("connect-mongo");
const http = require("http");
const commentRouter = require("./routes/commentRouter");
const notificationRouter = require("./routes/notificationRouter");
const configureSocket = require("./utils/socket");
const aiRouter = require("./routes/aiRouter");
const timeTrackingRouter = require("./routes/timeTrackingRouter");
const reportRouter = require("./routes/reportRouter");
const taskAllocationRouter = require("./routes/taskAllocationRouter");

// create server using express
const app = express();
// create server using http
const server = http.createServer(app);
const io = configureSocket(server);

// Ensure the Socket.io instance is set on the app
app.set("io", io);

if (process.env.RENDER) {
  process.env.NODE_ENV = "production";
  console.log("Running in production mode on Render");
}

// Add session middleware with MongoDB store
app.use(
  session({
    secret: process.env.JWT_SECRET || "naveen",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 2 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: "native", // Default
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
    },
  })
);

// Passport middleware for authentication
app.use(passport.initialize());
app.use(passport.session());
// Middleware
app.use(express.json());
app.use(cookieParser());

// cors configuration
app.use(
  cors({
    // origin: "https://pr-frontend-one.vercel.app", // // PRO URL
    // origin: "https://pr-frontendtesting01.vercel.app", // new pro url
    origin: "http://localhost:5173", // DEV URL
    credentials: true, // enable set-cookie headers
  })
);

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Cookies:`, req.cookies);
  next();
});

app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/projects", projectRouter);
app.use("/auth", authRouter);
app.use("/comments", commentRouter);
app.use("/notifications", notificationRouter);
app.use("/ai", aiRouter);
app.use("/time-tracking", timeTrackingRouter);
app.use("/reports", reportRouter)
app.use("/task-allocation", taskAllocationRouter)

const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("Welcome to the server!");
});

// Change from app.listen to server.listen
server.listen(PORT, async () => {
  await connectDb;
  console.log(`Server running on port ${PORT}`);
});
