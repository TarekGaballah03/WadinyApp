// src/modules/map/place.model.js
import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["cafe", "restaurant", "other"],
      required: true,
    },
    description: { type: String },
    address: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    coverImage: { type: String },
    images: [String],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },

    openingHours: {
      monday:    { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday:   { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday:  { open: String, close: String, closed: { type: Boolean, default: false } },
      friday:    { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday:  { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday:    { open: String, close: String, closed: { type: Boolean, default: false } },
    },

    averageRating: { type: Number, default: 0 },
    reviewCount:   { type: Number, default: 0 },
    priceLevel:    { type: Number, min: 1, max: 4, default: 2 },
    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text", description: "text", address: "text" });

export default mongoose.models.Place || mongoose.model("Place", placeSchema);
