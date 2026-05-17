const mongoose = require("mongoose");

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

    // GeoJSON point — enables $geoWithin / $near queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
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
    priceLevel:    { type: Number, min: 1, max: 4, default: 2 }, // 1=$  4=$$$$
    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index
placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text", description: "text", address: "text" });

module.exports = mongoose.model("Place", placeSchema);
