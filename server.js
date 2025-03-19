const express = require("express");
const connectDb = require("./config/db");
const userRouter = require("./routes/userRouter");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://imaginative-youtiao-079f60.netlify.app",
    // origin: "http://localhost:5173", // change this to your frontend URL
    credentials: true, // enable set-cookie headers
  })
);

app.use("/users", userRouter);

const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("Welcome to the server!");
});

app.listen(PORT, async () => {
  await connectDb;
  console.log(`Server running on port ${PORT}`);
});
