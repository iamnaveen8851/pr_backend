const express = require("express");
const signup = require("../controllers/auth/signup");
const getUsers = require("../controllers/auth/getUsers");
const login = require("../controllers/auth/login");
const logout = require("../controllers/auth/logout");

const userRouter = express.Router();

userRouter.get("/", getUsers);

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.post("/logout", logout);

module.exports = userRouter;
