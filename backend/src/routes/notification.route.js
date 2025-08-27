import express from "express";
import { isProtected } from "../middlewares/auth.middleware.js";
import { deleteNotification, getNotifications } from "../controllers/notfification.controller.js";

const router = express.Router();

router.route("/").get(isProtected, getNotifications);
router.route("/:notificationId").delete(isProtected, deleteNotification);

export default router;
