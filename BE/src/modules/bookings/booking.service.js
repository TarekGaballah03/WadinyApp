// src/modules/bookings/booking.service.js
import { bookingModel } from "../../DB/models/booking.model.js";
import { restaurantModel } from "../../DB/models/restaurant.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import { Encrypt } from "../../utils/encryption/encrypt.js";
import { Decrypt } from "../../utils/encryption/decrypt.js";

// ==================== Create Booking ====================
export const createBooking = asyncHandler(async (req, res, next) => {
  const { restaurantId, guestName, phone, date, time, guestCount } = req.body;

  // Ensure restaurant exists
  const restaurant = await restaurantModel.findOne({
    _id: restaurantId,
    isDeleted: false,
    isActive: true,
  });
  if (!restaurant) return next(new Error("Restaurant not found", { cause: 404 }));

  // Encrypt phone (same pattern as user phone)
  const encryptedPhone = await Encrypt({ key: phone, SECRET_KEY: process.env.SECRET_KEY });

  const booking = await bookingModel.create({
    restaurantId,
    userId: req.user._id,
    guestName,
    phone: encryptedPhone,
    date: new Date(date),
    time,
    guestCount: guestCount || 2,
  });

  return res.status(201).json({
    success: true,
    msg: `Table booked at ${restaurant.name} for ${guestCount} guests on ${date} at ${time}`,
    booking: {
      ...booking.toObject(),
      phone, // return decrypted phone to the user
    },
  });
});

// ==================== Get My Bookings ====================
export const getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await bookingModel
    .find({ userId: req.user._id, isDeleted: false })
    .populate("restaurantId", "name image address")
    .sort({ createdAt: -1 });

  // Decrypt phone for each booking
  const decrypted = await Promise.all(
    bookings.map(async (b) => {
      let phone = null;
      if (b.phone) {
        try {
          phone = await Decrypt({ key: b.phone, SECRET_KEY: process.env.SECRET_KEY });
        } catch {
          phone = null;
        }
      }
      return { ...b.toObject(), phone };
    })
  );

  return res.status(200).json({ success: true, bookings: decrypted });
});

// ==================== Get Restaurant Bookings (Owner/Admin) ====================
export const getRestaurantBookings = asyncHandler(async (req, res, next) => {
  const { restaurantId } = req.params;

  // Verify ownership if role is restaurant
  if (req.user.role === "restaurant") {
    const restaurant = await restaurantModel.findOne({
      _id: restaurantId,
      ownerId: req.user._id,
    });
    if (!restaurant) return next(new Error("Access denied", { cause: 403 }));
  }

  const bookings = await bookingModel
    .find({ restaurantId, isDeleted: false })
    .populate("userId", "name image")
    .sort({ date: 1 });

  const decrypted = await Promise.all(
    bookings.map(async (b) => {
      let phone = null;
      if (b.phone) {
        try {
          phone = await Decrypt({ key: b.phone, SECRET_KEY: process.env.SECRET_KEY });
        } catch {
          phone = null;
        }
      }
      return { ...b.toObject(), phone };
    })
  );

  return res.status(200).json({ success: true, bookings: decrypted });
});

// ==================== Cancel Booking ====================
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await bookingModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!booking) return next(new Error("Booking not found", { cause: 404 }));

  if (
    booking.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Access denied", { cause: 403 }));
  }

  if (booking.status === "cancelled") {
    return next(new Error("Booking is already cancelled", { cause: 400 }));
  }

  await bookingModel.findByIdAndUpdate(req.params.id, { status: "cancelled" });
  return res.status(200).json({ success: true, msg: "Booking cancelled" });
});

// ==================== Confirm Booking (Restaurant Owner/Admin) ====================
export const confirmBooking = asyncHandler(async (req, res, next) => {
  const booking = await bookingModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!booking) return next(new Error("Booking not found", { cause: 404 }));

  // Verify restaurant ownership
  if (req.user.role === "restaurant") {
    const restaurant = await restaurantModel.findOne({
      _id: booking.restaurantId,
      ownerId: req.user._id,
    });
    if (!restaurant) return next(new Error("Access denied", { cause: 403 }));
  }

  await bookingModel.findByIdAndUpdate(req.params.id, { status: "confirmed" });
  return res.status(200).json({ success: true, msg: "Booking confirmed" });
});
