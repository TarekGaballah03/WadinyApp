// src/modules/bookings/booking.validation.js
import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";

export const createBookingSchema = {
  body: Joi.object({
    restaurantId: generalRules.id.required(),
    guestName: Joi.string().min(2).max(60).required(),
    phone: Joi.string()
      .regex(/^[0-9+\-\s()]{10,15}$/)
      .required(),
    date: Joi.date().iso().greater("now").required(),
    time: Joi.string()
      .regex(/^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/)
      .required(),
    guestCount: Joi.number().integer().min(1).max(10).default(2),
  }).required(),
};

export const bookingIdSchema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }),
};

export const restaurantBookingsSchema = {
  params: Joi.object({
    restaurantId: generalRules.id.required(),
  }),
};
