// src/modules/map/map.routes.js
import { Router } from "express";
import { authentication, authorization } from "../../middleware/auth.js";
import { roles } from "../../DB/models/user.model.js";
import * as MC from "./map.controller.js";

const mapRouter = Router();

// Places
mapRouter.get("/places", MC.getAllPlaces);
mapRouter.get("/places/:id", MC.getPlaceById);
mapRouter.post("/places", authentication, authorization([roles.admin]), MC.createPlace);
mapRouter.put("/places/:id", authentication, authorization([roles.admin]), MC.updatePlace);
mapRouter.delete("/places/:id", authentication, authorization([roles.admin]), MC.deletePlace);

// Road Problems
mapRouter.get("/road-problems", MC.getAllRoadProblems);
mapRouter.post("/road-problems", authentication, MC.createRoadProblem);
mapRouter.put("/road-problems/:id/resolve", authentication, authorization([roles.admin]), MC.resolveRoadProblem);
mapRouter.delete("/road-problems/:id", authentication, authorization([roles.admin]), MC.deleteRoadProblem);

// Navigation
mapRouter.post("/directions", MC.getDirections);

// Search
mapRouter.get("/search", MC.searchPlaces);

export default mapRouter;
