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

const app = express();

// Add session middleware before other middleware
app.use(
  session({
    secret: process.env.JWT_SECRET || "naveen",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://pr-frontend-one.vercel.app", // // PRO URL
    // origin: "http://localhost:5173", // DEV URL
    credentials: true, // enable set-cookie headers
  })
);

app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("Welcome to the server!");
});

app.listen(PORT, async () => {
  await connectDb;
  console.log(`Server running on port ${PORT}`);
});
