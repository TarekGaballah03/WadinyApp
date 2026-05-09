// src/modules/reviews/review.service.js
import { reviewModel } from "../../DB/models/review.model.js";
import { restaurantModel } from "../../DB/models/restaurant.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";

// Helper: Recalculate and update restaurant's avgRating and totalReviews
const recalculateRestaurantRating = async (restaurantId) => {
  const reviews = await reviewModel.find({ restaurantId, isDeleted: false });
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

  await restaurantModel.findByIdAndUpdate(restaurantId, { avgRating, totalReviews });
  return { avgRating, totalReviews };
};

// ==================== Add Review ====================
export const addReview = asyncHandler(async (req, res, next) => {
  const { restaurantId, rating, comment } = req.body;

  const restaurant = await restaurantModel.findOne({ _id: restaurantId, isDeleted: false });
  if (!restaurant) return next(new Error("Restaurant not found", { cause: 404 }));

  // Check if user already reviewed (unique index enforces this, but give a friendly message)
  const existingReview = await reviewModel.findOne({
    restaurantId,
    userId: req.user._id,
    isDeleted: false,
  });
  if (existingReview) {
    return next(new Error("You have already reviewed this restaurant", { cause: 400 }));
  }

  const review = await reviewModel.create({
    restaurantId,
    userId: req.user._id,
    rating,
    comment,
  });

  // Recalculate restaurant stats
  const stats = await recalculateRestaurantRating(restaurantId);

  const populated = await review.populate("userId", "name image");

  return res.status(201).json({
    success: true,
    msg: "Review added",
    review: populated,
    restaurantStats: stats,
  });
});

// ==================== Get Reviews for a Restaurant ====================
export const getReviews = asyncHandler(async (req, res, next) => {
  const { restaurantId } = req.params;

  const restaurant = await restaurantModel.findOne({ _id: restaurantId, isDeleted: false });
  if (!restaurant) return next(new Error("Restaurant not found", { cause: 404 }));

  const reviews = await reviewModel
    .find({ restaurantId, isDeleted: false })
    .populate("userId", "name image")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    avgRating: restaurant.avgRating,
    totalReviews: restaurant.totalReviews,
    reviews,
  });
});

// ==================== Delete Review ====================
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await reviewModel.findOne({ _id: req.params.reviewId, isDeleted: false });
  if (!review) return next(new Error("Review not found", { cause: 404 }));

  if (
    review.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Access denied", { cause: 403 }));
  }

  await reviewModel.findByIdAndUpdate(req.params.reviewId, { isDeleted: true });

  // Recalculate restaurant stats after deletion
  const stats = await recalculateRestaurantRating(review.restaurantId);

  return res.status(200).json({ success: true, msg: "Review deleted", restaurantStats: stats });
});

// ==================== Like / Unlike a Review ====================
export const toggleReviewLike = asyncHandler(async (req, res, next) => {
  const review = await reviewModel.findOne({ _id: req.params.reviewId, isDeleted: false });
  if (!review) return next(new Error("Review not found", { cause: 404 }));

  const userId = req.user._id;
  const alreadyLiked = review.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    await reviewModel.findByIdAndUpdate(req.params.reviewId, { $pull: { likes: userId } });
  } else {
    await reviewModel.findByIdAndUpdate(req.params.reviewId, { $addToSet: { likes: userId } });
  }

  const updated = await reviewModel.findById(req.params.reviewId);
  return res.status(200).json({
    success: true,
    liked: !alreadyLiked,
    likesCount: updated.likes.length,
  });
});
