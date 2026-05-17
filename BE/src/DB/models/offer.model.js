// src/DB/models/offer.model.js
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
    },
    image: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    
    // ربط العرض بمطعم معين
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    
    // العرض بيضيفه صاحب المطعم أو الادمن بس
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["restaurant", "admin"],
      default: "restaurant",
    },
    
    // صلاحية العرض
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    
    // عدد المرات الكلية اللي استخدم فيها العرض
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    
    // --- التعديل الجديد ---
    // قائمة بالمستخدمين الذين استخدموا هذا العرض فعلياً
    usersUsed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // ---------------------

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// تحسين البحث عن طريق الكود لأنه سيكون الأكثر استخداماً
offerSchema.index({ code: 1 });

export const offerModel =
  mongoose.models.Offer || mongoose.model("Offer", offerSchema);