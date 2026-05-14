const Place = require("./place.model");
const RoadProblem = require("./roadProblem.model");
const axios = require("axios");

// ─── PLACES ────────────────────────────────────────────────────────────────

exports.getAllPlaces = async (req, res) => {
  try {
    const { type, lat, lng, radius = 5000 } = req.query;
    const filter = {};
    if (type) filter.type = type;

    // If coordinates provided, filter by proximity using $geoWithin
    if (lat && lng) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            parseFloat(radius) / 6378100, // convert meters to radians
          ],
        },
      };
    }

    const places = await Place.find(filter).select("-__v");
    res.status(200).json({ status: "success", results: places.length, data: places });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ status: "fail", message: "Place not found" });
    res.status(200).json({ status: "success", data: place });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json({ status: "success", data: place });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!place) return res.status(404).json({ status: "fail", message: "Place not found" });
    res.status(200).json({ status: "success", data: place });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ─── ROAD PROBLEMS ──────────────────────────────────────────────────────────

exports.getAllRoadProblems = async (req, res) => {
  try {
    const problems = await RoadProblem.find({ resolved: false })
      .populate("reportedBy", "name avatar")
      .sort("-createdAt");
    res.status(200).json({ status: "success", results: problems.length, data: problems });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.createRoadProblem = async (req, res) => {
  try {
    const problem = await RoadProblem.create({
      ...req.body,
      reportedBy: req.user._id,
    });
    const populated = await problem.populate("reportedBy", "name avatar");

    // Emit via Socket.io if available
    const io = req.app.get("io");
    if (io) io.emit("new_road_problem", populated);

    res.status(201).json({ status: "success", data: populated });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

exports.resolveRoadProblem = async (req, res) => {
  try {
    const problem = await RoadProblem.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: Date.now() },
      { new: true }
    );
    if (!problem) return res.status(404).json({ status: "fail", message: "Problem not found" });

    const io = req.app.get("io");
    if (io) io.emit("road_problem_resolved", { id: problem._id });

    res.status(200).json({ status: "success", data: problem });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteRoadProblem = async (req, res) => {
  try {
    await RoadProblem.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
// Uses OpenRouteService (free) — swap for Google Directions if you have a key

exports.getDirections = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, mode = "driving-car" } = req.body;
    // mode options: driving-car | foot-walking | cycling-regular

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
        distance: summary.distance, // meters
        duration: summary.duration, // seconds
        geometry: route.geometry, // encoded polyline
        steps,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ─── SEARCH ─────────────────────────────────────────────────────────────────

exports.searchPlaces = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
