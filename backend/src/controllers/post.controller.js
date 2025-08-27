import asyncHandler from "express-async-handler";
import { postModel } from "../model/post.model.js";
import { userModel } from "../model/user.model.js";
import { getAuth } from "@clerk/express";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { notificationModel } from "../model/notification.model.js";
import { commentModel } from "../model/comment.model.js";

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await postModel
    .find()
    .sort({ createdAt: -1 })
    .populate("user", "userName, profilePicture, firstName, lastName")
    .populate({
      path: "comments",
      select: "userName, profilePicture, firstName, lastName",
    });

  return res.status(200).json({ data: posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const posts = await postModel
    .findById(postId)
    .sort({ createdAt: -1 })
    .populate("user", "userName, profilePicture, firstName, lastName")
    .populate({
      path: "comments",
      select: "userName, profilePicture, firstName, lastName",
    });

  return res.status(200).json({ data: posts });
});

export const getUserPost = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await userModel.findOne({ userName: username });

  if (!user) return res.status(404), json({ error: "User not found" });

  const posts = await postModel
    .find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "userName, profilePicture, lastName, firstName",
      },
    });

  return res.status(200).json({ data: posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth();
  const { content } = req.body;
  const imageUrl = req.url;

  if (!content || !imageUrl) {
    return res.status(404).json({ error: "Content or image is required" });
  }

  const user = await userModel.find({ clerkUserId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  const response = await uploadToCloudinary(image);

  const post = await postModel.create({
    user: user._id,
    content: content || "",
    image: response.secure_url,
  });

  return res.status(200).json({ data: post });
});

export const likeaPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth();
  const { postId } = req.params;

  const user = await userModel.findOne({ clerkUserId: userId });
  const post = await postModel.findById(postId);

  if (!user || !post)
    return res.status(400).json({ error: "user or post not found" });

  const isLiked = post.likes.includes(user._id);

  if (isLiked) {
    await postModel.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
  } else {
    await postModel.findByIdAndUpdate(postId, {
      $push: { likes: user._id },
    });
  }

  if (post.user._id.toString() !== user._id.toString()) {
    notificationModel.create({
      from: user._id,
      to: post.user._id,
      type: "like",
      post: postId,
    });
  }

  return res.status(200).json({
    message: isLiked
      ? "Unliked the post successfully"
      : "Liked the post successfully",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth();

  const { postId } = req.params;

  const user = await userModel.findOne({ clerkUserId: userId });
  const post = await postModel.findById(postId);

  if (!user || !post)
    return res.status(400).json({ error: "user or post not found" });

  if (post.user._id.toString() !== user._id.toString()) {
    return res.status(400).json({ error: "You can't delete this post" });
  }

  await commentModel.deleteMany({ post: postId });

  await postModel.findByIdAndDelete(postId);

  return res.status(200).json({ message: "Post deleted successfully" });
});
