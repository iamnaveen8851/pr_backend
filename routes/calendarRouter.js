const { Router } = require("express");
const { google } = require("googleapis");
const { calendar } = require("googleapis/build/src/apis/calendar");
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();

const calendarRouter = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080/calendar/callback"
);

calendarRouter.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.json({ authUrl: url });
});

calendarRouter.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in user's session or database
    // This is a simplified example - in production, store tokens securely
    if (req.session) {
      req.session.googleTokens = tokens;
    }

    // Redirect to your frontend calendar page
    res.redirect("http://localhost:5173/calendar");
  } catch (error) {
    console.log("Error getting tokens: ", error);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
});

calendarRouter.get("events", authMiddleware, async (req, res) => {
  try {
    const tokens = req.session?.googleTokens;
    // check the token
    if (!tokens) {
      return res
        .status(401)
        .json({ message: "Google Calendar is not authorized. " });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json({ events: response.data.items });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});
