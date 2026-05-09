// src/DB/models/post.model.js
import mongoose from "mongoose";

export const postTypes = {
  social: "social",
  offer: "offer",
  hazard: "hazard",
};

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(postTypes),
      required: true,
      default: postTypes.social,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    location: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    // Offer-specific fields
    offerDiscount: {
      type: String,
      trim: true,
    },
    offerValidUntil: {
      type: Date,
    },
    // Linked restaurant (optional)
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    // Reactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

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

// Virtual counts
postSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

postSchema.virtual("dislikesCount").get(function () {
  return this.dislikes?.length || 0;
});

export const postModel =
  mongoose.models.Post || mongoose.model("Post", postSchema);
