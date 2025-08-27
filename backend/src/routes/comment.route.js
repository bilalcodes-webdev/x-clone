import express from "express";
import {
  createComment,
  deleteComment,
  getComments,
} from "../controllers/comments.controller.js";
import { isProtected } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/post/:postId").get(getComments);

router.route("/post/:postId").post(isProtected, createComment);
router.route("/:commentId").delete(isProtected, deleteComment);

export default router;
