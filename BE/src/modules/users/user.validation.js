// src/modules/users/user.validation.js
import joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";
import { genderTypes } from "../../DB/models/user.model.js";

export const signUpSchema = {
  body: joi.object({
    name: joi.string().min(3).max(30).required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("password")).required(),
    gender: joi.string().valid(genderTypes.female, genderTypes.male),
    phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
    role: joi.string().valid("user", "admin", "restaurant").optional(),

  }).required(),
  file: generalRules.file.required(),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    code: joi.string().length(4).required(),
  }).required(),
};

export const loginSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
  }).required(),
};

export const refreshTokenSchema = {
  body: joi.object({
    authorization: joi.string().required(),
  }).required(),
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
  }).required(),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalRules.email.required(),
    code: joi.string().length(4).required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required(),
  }).required(),
};

export const updateProfileSchema = {
  body: joi.object({
    name: joi.string().alphanum().min(3).max(30),
    gender: joi.string().valid(genderTypes.female, genderTypes.male),
    phone: joi.string().regex(/^01[0125][0-9]{8}$/),
    removeImage: joi.boolean(),
  }).required(),
  file: generalRules.file,
};

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required(),
  }).required(),
};

export const shareProfileSchema = {
  params: joi.object({
    id: generalRules.id.required(),
  }),
};

// ==================== Settings Validation ====================
export const updateNotificationsSchema = {
  body: joi.object({
    push: joi.boolean(),
    email: joi.boolean(),
    offers: joi.boolean(),
    comments: joi.boolean(),
    likes: joi.boolean(),
  }).required(),
};

export const updatePrivacySchema = {
  body: joi.object({
    showEmail: joi.boolean(),
    showPhone: joi.boolean(),
    showActivity: joi.boolean(),
  }).required(),
};

export const deleteAccountSchema = {
  body: joi.object({
    password: generalRules.password.required(),
  }).required(),
};

// ==================== Follow Validation ====================
export const followUserSchema = {
  params: joi.object({
    userId: generalRules.id.required(),
  }),
};