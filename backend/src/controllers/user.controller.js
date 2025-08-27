import asyncHandler from "express-async-handler";
import { userModel } from "../model/user.model.js";
import { clerkClient, getAuth } from "@clerk/express";
import { notificationModel } from "../model/notification.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await userModel.findOne({ userName: username });

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.status(200).json({ data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth();

  const user = await userModel.findOneAndUpdate(
    { clerkUserId: userId },
    req.body,
    { new: true }
  );

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ data: user });
});

export const syncUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth();

  const existingUser = await userModel.findOne({ clerkUserId: userId });

  if (existingUser) {
    return res
      .status(200)
      .json({ data: existingUser, message: "User alreay exists" });
  }

  const getUser = await clerkClient.users.getUser(userId);

  const newUser = await userModel.create({
    clerkUserId: userId,
    email: getUser.emailAddresses[0].emailAddress,
    firstName: getUser.firstName || "",
    lastName: getUser.lastName || "",
    userName: getUser.emailAddresses[0].emailAddress.split("@")[0],
    profilePicture: getUser.imageUrl || "",
  });

  return res
    .status(200)
    .json({ data: newUser, message: "User created successfully" });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth();

  const user = await userModel.findOne({ clerkUserId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.status(200).json({ data: user });
});
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req); // req pass karna zaroori hai

  const { targetUserId } = req.params;

  if (userId === targetUserId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  const userToFollow = await userModel.findById(targetUserId);
  const currentUser = await userModel.findOne({ clerkUserId: userId });

  if (!userToFollow || !currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const isFollowing = currentUser.following.includes(userToFollow._id);

  if (isFollowing) {
    // 🔹 Unfollow
    await userModel.findOneAndUpdate(
      { _id: currentUser._id },
      { $pull: { following: userToFollow._id } },
      { new: true }
    );

    await userModel.findOneAndUpdate(
      { _id: userToFollow._id },
      { $pull: { followers: currentUser._id } },
      { new: true }
    );
  } else {
    // 🔹 Follow
    await userModel.findOneAndUpdate(
      { _id: currentUser._id },
      { $push: { following: userToFollow._id } },
      { new: true }
    );

    await userModel.findOneAndUpdate(
      { _id: userToFollow._id },
      { $push: { followers: currentUser._id } },
      { new: true }
    );
  }

  // createNotfication
  await notificationModel.create({
    from: currentUser._id,
    to: targetUserId,
    type: "follow",
  });

  return res.status(200).json({
    message: isFollowing ? "unfollowed successfully" : "Followed successfully",
  });
});

