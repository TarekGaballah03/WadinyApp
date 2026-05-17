const express = require("express");
const router = express.Router();
const mapController = require("./map.controller");
const { protect, restrictTo } = require("../../middleware/auth.middleware");

// Places
router.get("/places", mapController.getAllPlaces);
router.get("/places/:id", mapController.getPlaceById);
router.post("/places", protect, restrictTo("admin"), mapController.createPlace);
router.put("/places/:id", protect, restrictTo("admin"), mapController.updatePlace);
router.delete("/places/:id", protect, restrictTo("admin"), mapController.deletePlace);

// Road Problems
router.get("/road-problems", mapController.getAllRoadProblems);
router.post("/road-problems", protect, mapController.createRoadProblem);
router.put("/road-problems/:id/resolve", protect, restrictTo("admin"), mapController.resolveRoadProblem);
router.delete("/road-problems/:id", protect, restrictTo("admin"), mapController.deleteRoadProblem);

// Navigation
router.post("/directions", mapController.getDirections);

// Search
router.get("/search", mapController.searchPlaces);

module.exports = router;
