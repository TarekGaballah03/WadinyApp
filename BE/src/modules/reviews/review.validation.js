// src/modules/reviews/review.validation.js
import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";

export const addReviewSchema = {
  body: Joi.object({
    restaurantId: generalRules.id.required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(3).max(500).required(),
  }).required(),
};

export const getReviewsSchema = {
  params: Joi.object({
    restaurantId: generalRules.id.required(),
  }),
};

export const reviewIdSchema = {
  params: Joi.object({
    reviewId: generalRules.id.required(),
  }),
};
