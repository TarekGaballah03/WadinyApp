// src/utils/generalRules/index.js
import Joi from "joi";
import { Types } from "mongoose";

// validation for ObjectId
const objectIdValidation = (value, helper) => {
  if (!Types.ObjectId.isValid(value)) {
    return helper.message("Invalid ObjectId");
  }
  return value;
};

export const generalRules = {
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "org", "eg"] },
  }),
  password: Joi.string().min(8).max(30),
  id: Joi.string().custom(objectIdValidation),
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid("image/png", "image/jpeg", "image/jpg", "image/gif").required(),
    size: Joi.number().max(5 * 1024 * 1024).required(),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    buffer: Joi.binary(),
  }).unknown(true),
};