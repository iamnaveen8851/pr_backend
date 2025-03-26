const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const userModel = require("../models/userModel");
const generateToken = require("../lib/jwtToken");
require("dotenv").config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({
          email: profile.emails[0].value,
        });
        if (!user) {
          user = new userModel({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: "", // No password for OAuth users
            role: "Employee",
          });

          await user.save();
        }

        const token = generateToken(
          {
            userId: user._id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Github OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({
          email: profile.emails?.[0]?.value || profile.username + "@github.com",
        });

        if (!user) {
          user = new userModel({
            username: profile.username,
            email:
              profile.emails?.[0]?.value || profile.username + "@github.com",
            password: "", // No password for OAuth users.
            role: "Employee", // Default role assigned
          });

          await user.save();
        }

        const token = generateToken(
          {
            userId: user._id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
