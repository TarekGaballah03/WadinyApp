// src/modules/posts/post.service.js
import { postModel } from "../../DB/models/post.model.js";
import { commentModel } from "../../DB/models/comment.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import cloudinary from "../../utils/cloudinary/index.js";

// ==================== Create Post ====================
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, body, type, location, lat, lng, offerDiscount, offerValidUntil, restaurantId } = req.body;

  let image = { secure_url: null, public_id: null };

  if (req?.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wadiny/posts",
      });
      image = { secure_url: result.secure_url, public_id: result.public_id };
    } catch (err) {
      console.log("Cloudinary error:", err.message);
    }
  }

  const post = await postModel.create({
    title,
    body,
    type,
    author: req.user._id,
    image,
    location,
    coordinates: lat && lng ? { lat, lng } : undefined,
    offerDiscount,
    offerValidUntil,
    restaurantId,
  });

  return res.status(201).json({ success: true, msg: "Post created", post });
});

// ==================== Get All Posts ====================
export const getPosts = asyncHandler(async (req, res, next) => {
  const { type, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  if (type) filter.type = type;

  const [posts, total] = await Promise.all([
    postModel
      .find(filter)
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    postModel.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    posts,
  });
});

// ==================== Get Single Post ====================
export const getPostById = asyncHandler(async (req, res, next) => {
  const post = await postModel
    .findOne({ _id: req.params.id, isDeleted: false })
    .populate("author", "name image");

  if (!post) return next(new Error("Post not found", { cause: 404 }));

  return res.status(200).json({ success: true, post });
});

// ==================== Delete Post ====================
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });

  if (!post) return next(new Error("Post not found", { cause: 404 }));

  // Only author or admin can delete
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("Access denied", { cause: 403 }));
  }

  // Remove image from Cloudinary
  if (post.image?.public_id) {
    try {
      await cloudinary.uploader.destroy(post.image.public_id);
    } catch (err) {
      console.log("Cloudinary delete error:", err.message);
    }
  }

  await postModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
  await commentModel.updateMany({ postId: req.params.id }, { isDeleted: true });

  return res.status(200).json({ success: true, msg: "Post deleted" });
});

// ==================== Like / Unlike Post ====================
export const toggleLike = asyncHandler(async (req, res, next) => {
  const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const userId = req.user._id;
  const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    // Unlike
    await postModel.findByIdAndUpdate(req.params.id, { $pull: { likes: userId, dislikes: userId } });
  } else {
    // Like and remove from dislikes if existed
    await postModel.findByIdAndUpdate(req.params.id, {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
    });
  }

  const updated = await postModel.findById(req.params.id);
  return res.status(200).json({
    success: true,
    liked: !alreadyLiked,
    likesCount: updated.likes.length,
    dislikesCount: updated.dislikes.length,
  });
});

// ==================== Dislike / Undislike Post ====================
export const toggleDislike = asyncHandler(async (req, res, next) => {
  const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const userId = req.user._id;
  const alreadyDisliked = post.dislikes.some((id) => id.toString() === userId.toString());

  if (alreadyDisliked) {
    await postModel.findByIdAndUpdate(req.params.id, { $pull: { dislikes: userId } });
  } else {
    await postModel.findByIdAndUpdate(req.params.id, {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId },
    });
  }

  const updated = await postModel.findById(req.params.id);
  return res.status(200).json({
    success: true,
    disliked: !alreadyDisliked,
    likesCount: updated.likes.length,
    dislikesCount: updated.dislikes.length,
  });
});

// ==================== Add Comment ====================
export const addComment = asyncHandler(async (req, res, next) => {
  const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const comment = await commentModel.create({
    postId: req.params.id,
    author: req.user._id,
    text: req.body.text,
  });

  const populated = await comment.populate("author", "name image");
  return res.status(201).json({ success: true, msg: "Comment added", comment: populated });
});

// ==================== Get Comments ====================
export const getComments = asyncHandler(async (req, res, next) => {
  const post = await postModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) return next(new Error("Post not found", { cause: 404 }));

  const comments = await commentModel
    .find({ postId: req.params.id, isDeleted: false })
    .populate("author", "name image")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, comments });
});

// ==================== Delete Comment ====================
export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await commentModel.findOne({
    _id: req.params.commentId,
    isDeleted: false,
  });

  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("Access denied", { cause: 403 }));
  }

  await commentModel.findByIdAndUpdate(req.params.commentId, { isDeleted: true });
  return res.status(200).json({ success: true, msg: "Comment deleted" });
});

// ==================== Like / Unlike Comment ====================
export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const comment = await commentModel.findOne({
    _id: req.params.commentId,
    isDeleted: false,
  });

  if (!comment) return next(new Error("Comment not found", { cause: 404 }));

  const userId = req.user._id;
  const alreadyLiked = comment.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    await commentModel.findByIdAndUpdate(req.params.commentId, { $pull: { likes: userId } });
  } else {
    await commentModel.findByIdAndUpdate(req.params.commentId, { $addToSet: { likes: userId } });
  }

  const updated = await commentModel.findById(req.params.commentId);
  return res.status(200).json({
    success: true,
    liked: !alreadyLiked,
    likesCount: updated.likes.length,
  });
});
