// src/modules/bookings/booking.controller.js
import { Router } from "express";
import * as BS from "./booking.service.js";
import * as BV from "./booking.validation.js";
import { authentication, authorization, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";

const bookingRouter = Router();

// Create a table booking (any logged-in user)
bookingRouter.post(
  "/create",
  authentication,
  validation(BV.createBookingSchema),
  BS.createBooking
);

// Get current user's bookings
bookingRouter.get("/my-bookings", authentication, BS.getMyBookings);

// Get all bookings for a specific restaurant (restaurant owner or admin)
bookingRouter.get(
  "/restaurant/:restaurantId",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  validation(BV.restaurantBookingsSchema),
  BS.getRestaurantBookings
);

// Cancel a booking (booking owner or admin)
bookingRouter.patch(
  "/:id/cancel",
  authentication,
  validation(BV.bookingIdSchema),
  BS.cancelBooking
);

// Confirm a booking (restaurant owner or admin)
bookingRouter.patch(
  "/:id/confirm",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  validation(BV.bookingIdSchema),
  BS.confirmBooking
);

export default bookingRouter;
