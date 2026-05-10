// src/modules/restaurants/restaurant.controller.js
import { Router } from "express";
import * as RS from "./restaurant.service.js";
import * as RV from "./restaurant.validation.js";
import { authentication, authorization } from "../../middleware/auth.js";
import { roles } from "../../DB/models/user.model.js"; // تم التعديل للاستيراد من الموديل مباشرة
import { validation } from "../../middleware/validation.js";
import { fileTypes, multerHost } from "../../middleware/multer.js";

const restaurantRouter = Router();

// Middleware لتحويل JSON strings من form-data (مفيد جداً عند التعامل مع الصور والـ Body في نفس الوقت)
const parseJsonFields = (req, res, next) => {
  const jsonFields = ["address", "hours", "tags", "cuisine"];
  jsonFields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        // لو مش JSON صالح، سيبه string والـ validation هيقوم بالواجب
      }
    }
  });
  // التأكد أن category عبارة عن string
  if (req.body.category && Array.isArray(req.body.category)) {
    req.body.category = req.body.category[0] || req.body.category;
  }
  next();
};

// ==================== Public Restaurant Routes (قبل الـ ID) ====================

// عرض كل العروض - تم نقله هنا ليتجنب الـ CastError
restaurantRouter.get("/offers", validation(RV.getOffersSchema), RS.getOffers);

// عرض كل المطاعم
restaurantRouter.get("/", validation(RV.getRestaurantsSchema), RS.getRestaurants);

// ==================== Restaurant CRUD Routes ====================

// Create Restaurant
restaurantRouter.post(
  "/create",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("attachment"),
  parseJsonFields,
  validation(RV.createRestaurantSchema),
  RS.createRestaurant
);

// Update Restaurant
restaurantRouter.patch(
  "/update/:id",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("image"),
  parseJsonFields,
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

// ==================== Offer Routes ====================

// Add Offer
restaurantRouter.post(
  "/offer/add",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  multerHost(fileTypes.image).single("image"),
  validation(RV.addOfferSchema),
  RS.addOffer
);

// Get My Restaurant Offers (لصاحب المطعم)
restaurantRouter.get(
  "/my-offers",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.getMyRestaurantOffers
);

// Delete Offer
restaurantRouter.delete(
  "/offer/delete/:id",
  authentication,
  authorization([roles.restaurant, roles.admin]),
  RS.deleteOffer
);

// Use Offer (لأي يوزر مسجل)
restaurantRouter.post("/offer/use", authentication, RS.useOffer);

// ==================== Dynamic Routes (دايماً في الآخر) ====================
restaurantRouter.get("/:id", RS.getRestaurantById);

export default restaurantRouter;