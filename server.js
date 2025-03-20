const express = require("express");
const connectDb = require("./config/db");
const userRouter = require("./routes/userRouter");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Determine which frontend URL to allow based on environment
const allowedOrigins = {
  development: "http://localhost:5173",
  production: "https://pr-frontend-one.vercel.app",
};

// Get current environment (Render sets NODE_ENV to 'production' automatically)
// const environment = process.env.NODE_ENV || "development";
const environment = process.env.NODE_ENV === "production" ? "production" : "development";

const origin = allowedOrigins[environment];

app.use(
  cors({
    origin: origin,
    // origin: "https://pr-frontend-one.vercel.app",
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
