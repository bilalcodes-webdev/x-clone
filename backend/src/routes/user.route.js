import express from "express";
import {
    followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { isProtected } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/profile:username").get(getUserProfile);

router.route("/profile").put(isProtected, updateProfile);

router.route("/sync").post(isProtected, syncUser);

router.route("/me").get(isProtected, getCurrentUser);

router.route("/follow/:targetUserId").post(isProtected, followUser);

export default router;
