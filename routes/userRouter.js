const express = require("express");
const signup = require("../controllers/signup");
const getUsers = require("../controllers/getUsers");
const login = require("../controllers/login");
const logout = require("../controllers/logout");

const userRouter = express.Router();

userRouter.get("/", getUsers);

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.post("/logout", logout)

module.exports = userRouter;
