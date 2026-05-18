// src/modules/map/map.controller.js
import Place from "./place.model.js";
import RoadProblem from "./roadProblem.model.js";
import axios from "axios";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";

// ─── PLACES ────────────────────────────────────────────────────────────────

export const getAllPlaces = asyncHandler(async (req, res) => {
  const { type, lat, lng, radius = 5000 } = req.query;
  const filter = {};
  if (type) filter.type = type;

  if (lat && lng) {
    filter.location = {
      $geoWithin: {
        $centerSphere: [
          [parseFloat(lng), parseFloat(lat)],
          parseFloat(radius) / 6378100,
        ],
      },
    };
  }

  const places = await Place.find(filter).select("-__v");
  res.status(200).json({ status: "success", results: places.length, data: places });
});

export const getPlaceById = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);
  if (!place) return res.status(404).json({ status: "fail", message: "Place not found" });
  res.status(200).json({ status: "success", data: place });
});

export const createPlace = asyncHandler(async (req, res) => {
  const place = await Place.create(req.body);
  res.status(201).json({ status: "success", data: place });
});

export const updatePlace = asyncHandler(async (req, res) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!place) return res.status(404).json({ status: "fail", message: "Place not found" });
  res.status(200).json({ status: "success", data: place });
});

export const deletePlace = asyncHandler(async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
});

// ─── ROAD PROBLEMS ──────────────────────────────────────────────────────────

export const getAllRoadProblems = asyncHandler(async (req, res) => {
  const problems = await RoadProblem.find({ resolved: false })
    .populate("reportedBy", "name avatar")
    .sort("-createdAt");
  res.status(200).json({ status: "success", results: problems.length, data: problems });
});

export const createRoadProblem = asyncHandler(async (req, res) => {
  const problem = await RoadProblem.create({
    ...req.body,
    reportedBy: req.user._id,
  });
  const populated = await problem.populate("reportedBy", "name avatar");

  const io = req.app.get("io");
  if (io) io.emit("new_road_problem", populated);

  res.status(201).json({ status: "success", data: populated });
});

export const resolveRoadProblem = asyncHandler(async (req, res) => {
  const problem = await RoadProblem.findByIdAndUpdate(
    req.params.id,
    { resolved: true, resolvedAt: Date.now() },
    { new: true }
  );
  if (!problem) return res.status(404).json({ status: "fail", message: "Problem not found" });

  const io = req.app.get("io");
  if (io) io.emit("road_problem_resolved", { id: problem._id });

  res.status(200).json({ status: "success", data: problem });
});

export const deleteRoadProblem = asyncHandler(async (req, res) => {
  await RoadProblem.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
});

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

export const getDirections = asyncHandler(async (req, res) => {
  const { originLat, originLng, destLat, destLng, mode = "driving-car" } = req.body;

  const ORS_KEY = process.env.ORS_API_KEY;
  const url = `https://api.openrouteservice.org/v2/directions/${mode}`;

  const response = await axios.post(
    url,
    {
      coordinates: [
        [parseFloat(originLng), parseFloat(originLat)],
        [parseFloat(destLng), parseFloat(destLat)],
      ],
    },
    {
      headers: {
        Authorization: ORS_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const route = response.data.routes[0];
  const summary = route.summary;
  const steps = route.segments[0].steps.map((s) => ({
    instruction: s.instruction,
    distance: s.distance,
    duration: s.duration,
  }));

  res.status(200).json({
    status: "success",
    data: {
      distance: summary.distance,
      duration: summary.duration,
      geometry: route.geometry,
      steps,
    },
  });
});

// ─── SEARCH ─────────────────────────────────────────────────────────────────

export const searchPlaces = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ status: "fail", message: "Query required" });

  const filter = {
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
    ],
  };
  if (type) filter.type = type;

  const places = await Place.find(filter).limit(20);
  res.status(200).json({ status: "success", results: places.length, data: places });
});
