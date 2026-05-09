// src/modules/reports/report.service.js
import { reportModel } from "../../DB/models/report.model.js";
import { postModel, postTypes } from "../../DB/models/post.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import cloudinary from "../../utils/cloudinary/index.js";

// ==================== Submit Report ====================
export const submitReport = asyncHandler(async (req, res, next) => {
  const { issueType, note, location, lat, lng, sharedToFeed } = req.body;

  let media = { secure_url: null, public_id: null };
  if (req?.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wadiny/reports",
        resource_type: "auto",
      });
      media = { secure_url: result.secure_url, public_id: result.public_id };
    } catch (err) {
      console.log("Cloudinary error:", err.message);
    }
  }

  const reportData = {
    issueType,
    note,
    media,
    location,
    coordinates: lat && lng ? { lat, lng } : undefined,
    sharedToFeed: sharedToFeed === "true" || sharedToFeed === true,
    reportedBy: req.user._id,
  };

  // If user chose to share to social feed, auto-create a post
  let linkedPost = null;
  if (reportData.sharedToFeed) {
    linkedPost = await postModel.create({
      title: issueType,
      body: note || `Reported a ${issueType} issue`,
      type: postTypes.hazard,
      author: req.user._id,
      image: media,
      location,
      coordinates: reportData.coordinates,
    });
    reportData.linkedPostId = linkedPost._id;
  }

  const report = await reportModel.create(reportData);

  return res.status(201).json({
    success: true,
    msg: "Report submitted",
    report,
    ...(linkedPost && { linkedPost }),
  });
});

// ==================== Get All Reports ====================
export const getReports = asyncHandler(async (req, res, next) => {
  const { issueType, status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  if (issueType) filter.issueType = issueType;
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    reportModel
      .find(filter)
      .populate("reportedBy", "name image")
      .populate("linkedPostId", "title body")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    reportModel.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    reports,
  });
});

// ==================== Get Single Report ====================
export const getReportById = asyncHandler(async (req, res, next) => {
  const report = await reportModel
    .findOne({ _id: req.params.id, isDeleted: false })
    .populate("reportedBy", "name image")
    .populate("linkedPostId");

  if (!report) return next(new Error("Report not found", { cause: 404 }));

  return res.status(200).json({ success: true, report });
});

// ==================== Resolve Report (Admin only) ====================
export const resolveReport = asyncHandler(async (req, res, next) => {
  const report = await reportModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!report) return next(new Error("Report not found", { cause: 404 }));

  await reportModel.findByIdAndUpdate(req.params.id, { status: "resolved" });
  return res.status(200).json({ success: true, msg: "Report marked as resolved" });
});

// ==================== Delete Report ====================
export const deleteReport = asyncHandler(async (req, res, next) => {
  const report = await reportModel.findOne({ _id: req.params.id, isDeleted: false });
  if (!report) return next(new Error("Report not found", { cause: 404 }));

  if (
    report.reportedBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new Error("Access denied", { cause: 403 }));
  }

  if (report.media?.public_id) {
    try {
      await cloudinary.uploader.destroy(report.media.public_id, { resource_type: "auto" });
    } catch (err) {
      console.log("Cloudinary delete error:", err.message);
    }
  }

  await reportModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
  return res.status(200).json({ success: true, msg: "Report deleted" });
});
