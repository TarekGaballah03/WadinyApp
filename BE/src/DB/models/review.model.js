// src/DB/models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 500,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per user per restaurant
reviewSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

reviewSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

export const reviewModel =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);
