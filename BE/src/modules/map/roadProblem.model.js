// src/modules/map/roadProblem.model.js
import mongoose from "mongoose";

const roadProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["pothole", "closure", "construction", "accident", "flooding", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
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
    address: { type: String },
    image: { type: String },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

roadProblemSchema.index({ location: "2dsphere" });

export default mongoose.models.RoadProblem || mongoose.model("RoadProblem", roadProblemSchema);
