const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const getComments = require("../controllers/comment/getComments");
const createComment = require("../controllers/comment/createComment");

const commentRouter = Router();

commentRouter.get("/", authMiddleware, getComments);

commentRouter.post("/createComment", authMiddleware, createComment);

module.exports = commentRouter;


