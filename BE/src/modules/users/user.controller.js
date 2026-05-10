// src/modules/users/user.controller.js
import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { authentication } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { fileTypes, multerHost } from "../../middleware/multer.js";

const userRouter = Router();

// ==================== Public Routes ====================
userRouter.post(
  "/signUp",
  multerHost(fileTypes.image).single("attachment"),
  validation(UV.signUpSchema),
  US.signUp
);

userRouter.patch(
  "/confirmEmail",
  validation(UV.confirmEmailSchema),
  US.confirmEmail
);

userRouter.post("/login", validation(UV.loginSchema), US.login);
userRouter.post("/loginWithGmail", US.loginWithGmail);
userRouter.get(
  "/refreshToken",
  validation(UV.refreshTokenSchema),
  US.refreshToken
);
userRouter.patch(
  "/forgetPassword",
  validation(UV.forgetPasswordSchema),
  US.forgetPassword
);
userRouter.patch(
  "/resetPassword",
  validation(UV.resetPasswordSchema),
  US.resetPassword
);

// ==================== Protected Routes ====================
userRouter.get(
  "/profile/:id",
  validation(UV.shareProfileSchema),
  authentication,
  US.shareProfile
);

userRouter.patch(
  "/updateProfile",
  multerHost(fileTypes.image).single("attachment"),
  validation(UV.updateProfileSchema),
  authentication,
  US.updateProfile
);

userRouter.patch(
  "/updatePassword",
  validation(UV.updatePasswordSchema),
  authentication,
  US.updatePassword
);

// ==================== Settings Routes ====================
userRouter.get("/settings", authentication, US.getSettings);
userRouter.patch(
  "/settings/notifications",
  validation(UV.updateNotificationsSchema),
  authentication,
  US.updateNotifications
);
userRouter.patch(
  "/settings/privacy",
  validation(UV.updatePrivacySchema),
  authentication,
  US.updatePrivacy
);
userRouter.delete(
  "/deleteAccount",
  validation(UV.deleteAccountSchema),
  authentication,
  US.deleteAccount
);

// ==================== Follow System Routes ====================
userRouter.patch(
  "/follow/:userId",
  validation(UV.followUserSchema),
  authentication,
  US.followUser
);
userRouter.patch(
  "/unfollow/:userId",
  validation(UV.followUserSchema),
  authentication,
  US.unfollowUser
);
userRouter.get("/followers", authentication, US.getFollowers);
userRouter.get("/following", authentication, US.getFollowing);
userRouter.get(
  "/checkFollow/:userId",
  validation(UV.followUserSchema),
  authentication,
  US.checkFollowing
);

// ==================== Profile Routes ====================
userRouter.get("/my-profile", authentication, US.getMyProfile);


// ==================== User Offers Routes ====================
// ✅ جلب عروض المستخدم (اللي استخدمها واللي متاحة)
userRouter.get("/my-offers", authentication, US.getUserOffers);







export default userRouter;