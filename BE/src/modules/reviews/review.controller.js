// src/modules/reviews/review.controller.js
import { Router } from "express";
import * as RWS from "./review.service.js";
import * as RWV from "./review.validation.js";
import { authentication } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";

const reviewRouter = Router();

// Add a review to a restaurant (logged-in user)
reviewRouter.post(
  "/add",
  authentication,
  validation(RWV.addReviewSchema),
  RWS.addReview
);

// Get all reviews for a restaurant (public)
reviewRouter.get(
  "/:restaurantId",
  validation(RWV.getReviewsSchema),
  RWS.getReviews
);

// Delete a review (owner or admin - checked inside service)
reviewRouter.delete(
  "/:reviewId",
  authentication,
  validation(RWV.reviewIdSchema),
  RWS.deleteReview
);

// Like/unlike a review
reviewRouter.patch(
  "/:reviewId/like",
  authentication,
  validation(RWV.reviewIdSchema),
  RWS.toggleReviewLike
);

export default reviewRouter;
