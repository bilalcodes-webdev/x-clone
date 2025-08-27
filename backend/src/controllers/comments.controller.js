import { getAuth } from "@clerk/express";
import asyncHandler from "express-async-handler";
import { postModel } from "../model/post.model.js";
import { commentModel } from "../model/comment.model.js";
import { userModel } from "../model/user.model.js";

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth();
  const { postId } = req.params;
  const { content } = req.body;

  if (!content)
    return res.status(400).json({ error: "Comment content is required" });

  const post = await postModel.findById(postId);
  const user = await userModel.findOne({ clerkUserId: userId });

  if (!post || !user)
    return res.status(404).json({ error: "Post or user not found" });

  const comment = await commentModel.create({
    user: userId,
    post: postId,
    content: req.body.content,
  });

  await postModel.findOneAndUpdate(
    { _id: postId },
    { $push: { comments: comment._id } }
  );

  if (post.user.toString() !== user._id.toString()) {
    await notificationModel.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  return res.status(200).json({ data: comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth();
  const { commentId } = req.body;

  const comment = await commentModel.findById(commentId);
  const user = await userModel.findOne({ clerkUserId: userId });

  if (!user | !comment)
    return res.status(400).json({ error: "User or comment not found" });

  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(400)
      .json({ error: "You are not authorized to delete this comment" });
  }

  await commentModel.findByIdAndDelete(commentId);

  return res.status(200).json({ message: "Comment deleted successfully" });
});

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await commentModel
    .find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "userName, fullName lastName profilePicture");

  return res.status(200).json({ data: comments });
});
