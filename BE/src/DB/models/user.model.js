// src/DB/models/user.model.js
import mongoose from "mongoose";

export const genderTypes = {
  male: "male",
  female: "female",
};

export const roleTypes = {
  user: "user",
  admin: "admin",
   restaurant: "restaurant", 
};

export const roles = {
  user: "user",
  admin: "admin",
  restaurant: "restaurant",
};

export const providerTypes = {
  system: "system",
  google: "google",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: 8,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    image: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    changePasswordAt: Date,
    otpNewEmail: String,
    tempEmail: String,
    otpEmail: String,
    otpPassword: String,
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    // Settings
    settings: {
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        offers: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
      },
      privacy: {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        showActivity: { type: Boolean, default: true },
      },
    },
    // Follow system
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const userModel =
  mongoose.model.User || mongoose.model("User", userSchema);