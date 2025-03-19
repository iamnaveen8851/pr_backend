const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const connectDb = mongoose.connect(process.env.MONGODB_URI);

module.exports = connectDb;
