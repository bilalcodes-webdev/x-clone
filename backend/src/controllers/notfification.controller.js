import { getAuth } from "@clerk/express";
import asyncyncHandler from "express-async-handler";
import { notificationModel } from "../model/notification.model.js";

export const getNotifications = asyncyncHandler(async (req, res) => {
  const { userId } = getAuth();
  const user = await userModel.findOne({ clerkUserId: userId });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const notifications = await notificationModel
    .find({ user: user._id })
    .populate({
      path: "user",
      select: "userName profilePicture firstName lastName",
    })
    .populate({
      path: "post",
      select: "content image",
    })
    .populate({
      path: "comment",
      select: "content",
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ notifications });
});

export const deleteNotification = asyncyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = getAuth();
  const user = await userModel.findOne({ clerkUserId: userId });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const notification = await notificationModel.findById(notificationId);

  if (!notification) {
    return res.status(400).json({ error: "Notification not found" });
  }

  if (notification.user.toString() !== user._id.toString()) {
    return res.status(400).json({ error: "You are not authorized" });
  }

  await notification.deleteOne();

  return res.status(200).json({ message: "Notification deleted" });
});
