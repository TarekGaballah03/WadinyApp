// src/modules/posts/post.controller.js
import { Router } from "express";
import * as PS from "./post.service.js";
import * as PV from "./post.validation.js";
import { authentication } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { fileTypes, multerHost } from "../../middleware/multer.js";

const postRouter = Router();

// ==================== Post Routes ====================

// Create a new post (social or offer; hazard uses /reports)
postRouter.post(
  "/create",
  authentication,
  multerHost(fileTypes.image).single("attachment"),
  validation(PV.createPostSchema),
  PS.createPost
);

// Get all posts (public, filterable by type)
postRouter.get("/", validation(PV.getPostsSchema), PS.getPosts);

// Get single post
postRouter.get("/:id", validation(PV.postIdSchema), PS.getPostById);

// Delete post (owner or admin only - checked inside service)
postRouter.delete("/:id", authentication, validation(PV.postIdSchema), PS.deletePost);

// Like a post
postRouter.patch("/:id/like", authentication, validation(PV.postIdSchema), PS.toggleLike);

// Dislike a post
postRouter.patch("/:id/dislike", authentication, validation(PV.postIdSchema), PS.toggleDislike);

// ==================== Comment Routes ====================

// Add a comment to a post
postRouter.post("/:id/comment", authentication, validation(PV.addCommentSchema), PS.addComment);

// Get all comments for a post
postRouter.get("/:id/comments", validation(PV.postIdSchema), PS.getComments);

// Delete a comment (owner or admin - checked inside service)
postRouter.delete(
  "/comment/:commentId",
  authentication,
  validation(PV.commentIdSchema),
  PS.deleteComment
);

// Like a comment
postRouter.patch(
  "/comment/:commentId/like",
  authentication,
  validation(PV.commentIdSchema),
  PS.toggleCommentLike
);

export default postRouter;
