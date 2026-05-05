// src/modules/restaurants/restaurant.controller.js
import { Router } from "express";
import * as RS from "./restaurant.service.js";
import * as RV from "./restaurant.validation.js";
import { authentication, authorization, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { fileTypes, multerHost } from "../../middleware/multer.js";

const restaurantRouter = Router();

// ==================== Restaurant CRUD Routes ====================

// Create Restaurant (لصاحب المطعم أو الادمن)
restaurantRouter.post(
  "/create",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("image"),
  validation(RV.createRestaurantSchema),
  RS.createRestaurant
);

// Update Restaurant
restaurantRouter.patch(
  "/update/:id",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("image"),
  validation(RV.updateRestaurantSchema),
  RS.updateRestaurant
);

// Delete Restaurant (Soft Delete)
restaurantRouter.delete(
  "/delete/:id",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.deleteRestaurant
);

// Get My Restaurant (لصاحب المطعم)
restaurantRouter.get(
  "/my-restaurant",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.getMyRestaurant
);

// ==================== Public Restaurant Routes ====================
restaurantRouter.get("/", validation(RV.getRestaurantsSchema), RS.getRestaurants);
restaurantRouter.get("/:id", RS.getRestaurantById);

// ==================== Offer Routes ====================

// Add Offer (لصاحب المطعم أو الادمن بس - ممنوع على اليوزر العادي)
restaurantRouter.post(
  "/offer/add",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("image"),
  validation(RV.addOfferSchema),
  RS.addOffer
);

// Get All Offers (للجميع - مع فلترة)
restaurantRouter.get("/offers", validation(RV.getOffersSchema), RS.getOffers);

// Get My Restaurant Offers (لصاحب المطعم يشوف عروضه)
restaurantRouter.get(
  "/my-offers",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.getMyRestaurantOffers
);

// Delete Offer (لصاحب المطعم أو الادمن بس)
restaurantRouter.delete(
  "/offer/delete/:id",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.deleteOffer
);

// Use Offer (لأي يوزر مسجل)
restaurantRouter.post("/offer/use", authentication, RS.useOffer);

export default restaurantRouter;