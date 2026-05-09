// src/modules/posts/post.validation.js
import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";
import { postTypes } from "../../DB/models/post.model.js";

export const createPostSchema = {
  body: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    body: Joi.string().min(3).max(1000).required(),
    type: Joi.string()
      .valid(...Object.values(postTypes))
      .required(),
    location: Joi.string().max(200),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    offerDiscount: Joi.when("type", {
      is: postTypes.offer,
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    offerValidUntil: Joi.date().iso().optional(),
    restaurantId: generalRules.id.optional(),
  }).required(),
  file: generalRules.file.optional(),
};

export const getPostsSchema = {
  query: Joi.object({
    type: Joi.string().valid(...Object.values(postTypes)),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

export const postIdSchema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }),
};

export const addCommentSchema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }),
  body: Joi.object({
    text: Joi.string().min(1).max(500).required(),
  }).required(),
};

export const commentIdSchema = {
  params: Joi.object({
    commentId: generalRules.id.required(),
  }),
};
