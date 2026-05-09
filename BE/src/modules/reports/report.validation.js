// src/modules/reports/report.validation.js
import Joi from "joi";
import { generalRules } from "../../utils/generalRules/index.js";
import { issueTypes } from "../../DB/models/report.model.js";

export const submitReportSchema = {
  body: Joi.object({
    issueType: Joi.string()
      .valid(...Object.values(issueTypes))
      .required(),
    note: Joi.string().max(500).optional(),
    location: Joi.string().max(200).optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    sharedToFeed: Joi.boolean().default(false),
  }).required(),
  file: generalRules.file.optional(),
};

export const getReportsSchema = {
  query: Joi.object({
    issueType: Joi.string().valid(...Object.values(issueTypes)),
    status: Joi.string().valid("active", "resolved"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

export const reportIdSchema = {
  params: Joi.object({
    id: generalRules.id.required(),
  }),
};
