const { Router } = require("express");
const passport = require("../middlewares/passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authRouter = Router();
const generateToken = require("../lib/jwtToken");
const userModel = require("../models/userModel");
// Keep your existing OAuth routes
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const { user, token } = req.user;

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173");
  }
);

// Add a new route to handle token verification from @react-oauth/google
authRouter.post("/google/verify-token", async (req, res) => {
  try {
    const { credential, clientId } = req.body;
    console.log("Google auth data received:", {
      credential: credential?.substring(0, 20) + "...",
      clientId,
    });

    if (!credential) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the token with Google
    const response = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential
    );
    const data = await response.json();
    console.log("Google token verification response:", data);

    if (data.error) {
      return res
        .status(401)
        .json({ message: "Invalid Google token", error: data.error });
    }

    let user = await userModel.findOne({ email: data.email });
    console.log("User found in database:", !!user);

    // If user doesn't exist, create a new one
    if (!user) {
      console.log("Creating new user with email:", data.email);
      user = new userModel({
        username: data.name || data.email.split("@")[0],
        email: data.email,
      });

      await user.save();
      console.log("New user created with ID:", user._id);
    }

    // Generate JWT token
    const token = generateToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    // Set cookie and send response
    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Changed from "development" to "production"
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    console.log("Authentication successful for user:", user.username);
    res.status(200).json({
      message: "Google authentication successful",
      user: user.username,
      accessToken: token,
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("Google token verification error:", error);
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
});

// Keep your existing GitHub routes and verify endpoint
authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const { user, token } = req.user;

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173");
  }
);

authRouter.get("/verify", (req, res) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      authenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      accessToken: token,
    });
  } catch (error) {
    return res.json({ authenticated: false });
  }
});

// Add GitHub token verification endpoint
authRouter.post("/github-firebase", async (req, res) => {
  try {
    const { accessToken, user } = req.body;
    console.log("Firebase GitHub auth data received");

    if (!accessToken || !user) {
      return res
        .status(400)
        .json({ message: "GitHub token and user data are required" });
    }

    // Find or create user
    let dbUser = await userModel.findOne({ email: user.email });
    console.log("User found in database:", !!dbUser);

    if (!dbUser) {
      console.log("Creating new user with email:", user.email);
      // Generate a random password for OAuth users to satisfy validation
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      
      dbUser = new userModel({
        username: user.displayName || user.email.split("@")[0],
        email: user.email,
        password: randomPassword, // Use random password instead of empty string
        role: "Employee", // Default role
        authProvider: "github" // Add a field to indicate this is an OAuth user
      });

      await dbUser.save();
      console.log("New user created with ID:", dbUser._id);
    }

    // Generate JWT token
    const token = generateToken(
      {
        userId: dbUser._id,
        email: dbUser.email,
        role: dbUser.role,
      },
      process.env.JWT_SECRET
    );

    // Set cookie and send response
    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000,
    });

    console.log("Authentication successful for user:", dbUser.username);
    res.status(200).json({
      message: "GitHub authentication successful",
      user: dbUser.username,
      accessToken: token,
      userId: dbUser._id,
      role: dbUser.role,
    });
  } catch (error) {
    console.error("GitHub authentication error:", error);
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
});

module.exports = authRouter;
