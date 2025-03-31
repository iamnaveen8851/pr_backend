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
const app = express();

// Add session middleware before other middleware
// app.use(
//   session({
//     secret: process.env.JWT_SECRET || "naveen",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI,
//       ttl: 14 * 24 * 60 * 60,
//       autoRemove: "native",
//     }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24 * 14,
//     }
//   })
// );
// Add session middleware with MongoDB store

if (process.env.RENDER) {
  process.env.NODE_ENV = "production";
  console.log("Running in production mode on Render");
}
app.use(
  session({
    secret: process.env.JWT_SECRET || "naveen",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      autoRemove: "native", // Default
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    // origin: "https://pr-frontend-one.vercel.app", // // PRO URL
    origin: "https://pr-frontendtesting01.vercel.app", // new pro url
    // origin: "http://localhost:5173", // DEV URL
    credentials: true, // enable set-cookie headers
  })
);

// Updated CORS configuration to handle both environments
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? "https://pr-frontend-one.vercel.app"
//         : "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Cookies:`, req.cookies);
  next();
});

app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/projects", projectRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => {
  res.send("Welcome to the server!");
});

app.listen(PORT, async () => {
  await connectDb;
  console.log(`Server running on port ${PORT}`);
});
