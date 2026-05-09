// src/DB/models/booking.model.js
import mongoose from "mongoose";

export const bookingStatuses = {
  pending: "pending",
  confirmed: "confirmed",
  cancelled: "cancelled",
};

const bookingSchema = new mongoose.Schema(
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
    guestName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 60,
    },
    // Phone stored encrypted via CryptoJS (same pattern as user.phone)
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true, // e.g. "7:30 PM"
      trim: true,
    },
    guestCount: {
      type: Number,
      default: 2,
      min: 1,
      max: 10,
    },
    status: {
      type: String,
      enum: Object.values(bookingStatuses),
      default: bookingStatuses.pending,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const bookingModel =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
