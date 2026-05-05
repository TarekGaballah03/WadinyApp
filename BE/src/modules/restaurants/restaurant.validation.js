// src/modules/restaurants/restaurant.validation.js
import joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";

export const createRestaurantSchema = {
  body: joi.object({
    name: joi.string().min(3).max(100).required(),
    location: joi.string().required(),
    address: joi.object({
      street: joi.string().required(),
      city: joi.string().default("Alexandria"),
      area: joi.string(),
      coordinates: joi.object({
        lat: joi.number(),
        lng: joi.number(),
      }),
    }).required(),
    category: joi.string().valid("cafe", "restaurant", "fastfood", "bakery", "juicebar"),
    cuisine: joi.array().items(joi.string()),
    hours: joi.object({
      open: joi.string(),
      close: joi.string(),
    }),
    phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
    priceRange: joi.string().valid("$", "$$", "$$$", "$$$$"),
    tags: joi.array().items(joi.string()),
  }).required(),
  file: generalRules.file.required(),
};

export const updateRestaurantSchema = {
  body: joi.object({
    name: joi.string().min(3).max(100),
    location: joi.string(),
    address: joi.object({
      street: joi.string(),
      city: joi.string(),
      area: joi.string(),
      coordinates: joi.object({
        lat: joi.number(),
        lng: joi.number(),
      }),
    }),
    category: joi.string().valid("cafe", "restaurant", "fastfood", "bakery", "juicebar"),
    cuisine: joi.array().items(joi.string()),
    hours: joi.object({
      open: joi.string(),
      close: joi.string(),
    }),
    phone: joi.string().regex(/^01[0125][0-9]{8}$/),
    priceRange: joi.string().valid("$", "$$", "$$$", "$$$$"),
    tags: joi.array().items(joi.string()),
  }).required(),
  file: generalRules.file,
};

export const addOfferSchema = {
  body: joi.object({
    restaurantId: generalRules.id.required(),
    title: joi.string().min(3).max(100).required(),
    description: joi.string().min(5).required(),
    discount: joi.string().required(),
    validUntil: joi.date().greater("now").required(),
    maxUses: joi.number().min(1),
  }).required(),
  file: generalRules.file,
};

export const getRestaurantsSchema = {
  query: joi.object({
    category: joi.string().valid("cafe", "restaurant", "fastfood", "bakery", "juicebar"),
    search: joi.string(),
    minRating: joi.number().min(0).max(5),
    sort: joi.string().valid("rating", "newest", "name"),
    page: joi.number().min(1).default(1),
    limit: joi.number().min(1).max(50).default(10),
  }),
};

export const getOffersSchema = {
  query: joi.object({
    restaurantId: generalRules.id,
    isActive: joi.boolean(),
    sort: joi.string().valid("newest", "expiring", "popular"),
    page: joi.number().min(1).default(1),
    limit: joi.number().min(1).max(50).default(10),
  }),
};