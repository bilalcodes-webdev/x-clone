import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getUserPost,
  likeaPost,
} from "../controllers/post.controller.js";

import { isProtected } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/").get(getAllPosts);

router.route("/:postId").get(getPost);

router.route("/user/:username").get(getUserPost);

router.route("/create").post(isProtected, upload.single("image"), createPost);

router.route("/:postId/like").post(isProtected, likeaPost);

router.route("/:postId/delete").delete(isProtected, deletePost);

export default router;
