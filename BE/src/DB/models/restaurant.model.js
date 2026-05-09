// src/DB/models/restaurant.model.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    // معلومات أساسية
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, default: "Alexandria" },
      area: { type: String },  // مثلاً: سموحة, الدخيلة, سبورتنج
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String },
    },
    coverImage: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    gallery: [
      {
        secure_url: { type: String },
        public_id: { type: String },
      },
    ],
    
    // معلومات المطعم
    category: {
      type: String,
      enum: ["cafe", "restaurant", "fastfood", "bakery", "juicebar"],
      default: "restaurant",
    },
    cuisine: [String],  // ["Italian", "Seafood", "Coffee"]
    hours: {
      open: { type: String, default: "9:00 AM" },
      close: { type: String, default: "11:00 PM" },
    },
    phone: {
      type: String,
      required: true,
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },
    tags: [String],  // ["Cozy", "Free WiFi", "Parking"]
    
    // مالك المطعم
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // إحصائيات
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const restaurantModel =
  mongoose.model.Restaurant || mongoose.model("Restaurant", restaurantSchema);