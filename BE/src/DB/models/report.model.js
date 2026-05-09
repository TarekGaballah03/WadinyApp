// src/DB/models/report.model.js
import mongoose from "mongoose";

export const issueTypes = {
  Pothole: "Pothole",
  RoadBlock: "Road Block",
  Accident: "Accident",
  HeavyTraffic: "Heavy Traffic",
  Construction: "Construction",
  Other: "Other",
};

export const reportStatuses = {
  active: "active",
  resolved: "resolved",
};

const reportSchema = new mongoose.Schema(
  {
    issueType: {
      type: String,
      enum: Object.values(issueTypes),
      required: true,
      default: issueTypes.Pothole,
    },
    note: {
      type: String,
      trim: true,
    },
    media: {
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
    sharedToFeed: {
      type: Boolean,
      default: false,
    },
    linkedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(reportStatuses),
      default: reportStatuses.active,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const reportModel =
  mongoose.models.Report || mongoose.model("Report", reportSchema);
