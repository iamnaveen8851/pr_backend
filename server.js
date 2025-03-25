const express = require("express");
const connectDb = require("./config/db");
const userRouter = require("./routes/userRouter");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const taskRouter = require("./routes/taskRouter");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // origin: "https://pr-frontend-one.vercel.app", // // PRO URL
    origin: "http://localhost:5173", // DEV URL
    credentials: true, // enable set-cookie headers
  })
);

app.use("/users", userRouter);
app.use("/tasks", taskRouter)

const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("Welcome to the server!");
});

app.listen(PORT, async () => {
  await connectDb;
  console.log(`Server running on port ${PORT}`);
});
