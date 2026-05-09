// src/modules/reports/report.controller.js
import { Router } from "express";
import * as RS from "./report.service.js";
import * as RV from "./report.validation.js";
import { authentication, authorization, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { fileTypes, multerHost } from "../../middleware/multer.js";

const reportRouter = Router();

// Submit a road hazard report (any logged-in user)
reportRouter.post(
  "/submit",
  authentication,
  multerHost(fileTypes.image).single("media"),
  validation(RV.submitReportSchema),
  RS.submitReport
);

// Get all reports (public, filterable)
reportRouter.get("/", validation(RV.getReportsSchema), RS.getReports);

// Get single report
reportRouter.get("/:id", validation(RV.reportIdSchema), RS.getReportById);

// Resolve a report (admin only)
reportRouter.patch(
  "/:id/resolve",
  authentication,
  authorization([roles.admin]),
  validation(RV.reportIdSchema),
  RS.resolveReport
);

// Delete a report (owner or admin - checked inside service)
reportRouter.delete(
  "/:id",
  authentication,
  validation(RV.reportIdSchema),
  RS.deleteReport
);

export default reportRouter;
