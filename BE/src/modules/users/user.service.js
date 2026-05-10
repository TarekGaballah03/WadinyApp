// src/modules/users/user.service.js
import { userModel, providerTypes, roles } from "../../DB/models/user.model.js";
import { Encrypt } from "../../utils/encryption/encrypt.js";
import { Decrypt } from "../../utils/encryption/decrypt.js";
import { Hash } from "../../utils/encryption/hash.js";
import { Compare } from "../../utils/encryption/compare.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import { eventEmitter } from "../../utils/sendEmail.events/index.js";
import { generalToken } from "../../utils/token/generalToken.js";
import { decodedToken, tokenTypes } from "../../middleware/auth.js";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../utils/cloudinary/index.js";

// --- Helper to select signature based on role ---
const getSignatures = (role) => {
  let access_sig = process.env.ACCESS_SIGNATURE_USER;
  let refresh_sig = process.env.REFRESH_SIGNATURE_USER;

  if (role === roles.admin) {
    access_sig = process.env.ACCESS_SIGNATURE_ADMIN;
    refresh_sig = process.env.REFRESH_SIGNATURE_ADMIN;
  } else if (role === roles.restaurant) {
    access_sig = process.env.ACCESS_SIGNATURE_REST;
    refresh_sig = process.env.REFRESH_SIGNATURE_REST;
  }
  return { access_sig, refresh_sig };
};

// --- Helper to get prefix based on role ---
const getTokenPrefix = (role) => {
  if (role === roles.admin) return process.env.PREFIX_TOKEN_ADMIN;
  if (role === roles.restaurant) return process.env.PREFIX_TOKEN_REST;
  return process.env.PREFIX_TOKEN_USER;
};

// ==================== 1. Sign Up ====================
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, gender, role } = req.body;

  if (await userModel.findOne({ email })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

  const hashedPassword = await Hash({ key: password, SALT_ROUNDS: process.env.SALT_ROUNDS });
  const encryptedPhone = await Encrypt({ key: phone, SECRET_KEY: process.env.SECRET_KEY });

  let image = {};
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: "wadiny/users",
    });
    image = { secure_url, public_id };
  }

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    gender,
    image,
    role: role || "user",
  });

  eventEmitter.emit("sendEmailConfirmation", { email, id: user._id });

  return res.status(201).json({ msg: "User created. Please check your email to confirm.", user });
});

// ==================== 2. Confirm Email ====================
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await userModel.findOne({ email, confirmed: false });

  if (!user) return next(new Error("User not found or already confirmed", { cause: 404 }));

  if (!(await Compare({ key: otp, hashed: user.otpEmail }))) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await userModel.updateOne({ email }, { confirmed: true, $unset: { otpEmail: 1 } });
  return res.status(200).json({ msg: "Email confirmed successfully" });
});

// ==================== 3. Login ====================
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, confirmed: true, isDeleted: false });
  if (!user) return next(new Error("Invalid email or not confirmed", { cause: 404 }));

  if (!(await Compare({ key: password, hashed: user.password }))) {
    return next(new Error("Invalid password", { cause: 400 }));
  }

  const { access_sig, refresh_sig } = getSignatures(user.role);

  const access_token = await generalToken({
    payload: { email, id: user._id },
    SIGNATURE: access_sig,
    option: { expiresIn: "1d" },
  });

  const refresh_token = await generalToken({
    payload: { email, id: user._id },
    SIGNATURE: refresh_sig,
    option: { expiresIn: "7d" },
  });

  const tokenPrefix = getTokenPrefix(user.role);

  return res.status(200).json({
    msg: "Login successful",
    token: {
      access_token,
      refresh_token,
      prefix: tokenPrefix,
    },
    role: user.role,
  });
});

// ==================== 4. Refresh Token ====================
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.refresh,
    next,
  });

  const { access_sig } = getSignatures(user.role);
  const tokenPrefix = getTokenPrefix(user.role);

  const access_token = await generalToken({
    payload: { email: user.email, id: user._id },
    SIGNATURE: access_sig,
    option: { expiresIn: "1d" },
  });

  return res.status(200).json({ 
    msg: "Token refreshed", 
    access_token,
    prefix: tokenPrefix 
  });
});

// ==================== 5. Login With Gmail ====================
export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const { email, email_verified, picture, name } = ticket.getPayload();

  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      name, email,
      confirmed: email_verified,
      image: { secure_url: picture, public_id: null },
      provider: providerTypes.google,
      role: "user",
    });
  }

  const { access_sig } = getSignatures(user.role);
  const tokenPrefix = getTokenPrefix(user.role);

  const access_token = await generalToken({
    payload: { email, id: user._id },
    SIGNATURE: access_sig,
    option: { expiresIn: "1d" },
  });

  return res.status(200).json({ 
    msg: "Google login successful", 
    access_token,
    prefix: tokenPrefix 
  });
});

// ==================== 6. Forget Password ====================
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email, isDeleted: false });
  if (!user) return next(new Error("Email not found", { cause: 404 }));

  eventEmitter.emit("forgetPassword", { email });
  return res.status(200).json({ msg: "OTP sent to your email" });
});

// ==================== 7. Reset Password ====================
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  const user = await userModel.findOne({ email, isDeleted: false });
  if (!user) return next(new Error("Email not exists", { cause: 404 }));

  if (!(await Compare({ key: code, hashed: user.otpPassword }))) {
    return next(new Error("Invalid code", { cause: 400 }));
  }

  const hash = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS });

  await userModel.updateOne(
    { email },
    { password: hash, confirmed: true, $unset: { otpPassword: 0 } }
  );

  return res.status(201).json({ msg: "Password reset successfully" });
});

// ==================== 8. Update Profile ====================
export const updateProfile = asyncHandler(async (req, res, next) => {
  const updateData = {};

  if (req.body.removeImage === true || req.body.removeImage === "true") {
    if (req.user.image?.public_id) {
      await cloudinary.uploader.destroy(req.user.image.public_id).catch(() => {});
    }
    updateData.image = { secure_url: null, public_id: null };
  }

  if (req.body.name) updateData.name = req.body.name;

  if (req.body.phone) {
    updateData.phone = await Encrypt({ key: req.body.phone, SECRET_KEY: process.env.SECRET_KEY });
  }

  if (req.file) {
    if (req.user.image?.public_id && !req.body.removeImage) {
      await cloudinary.uploader.destroy(req.user.image.public_id).catch(() => {});
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: "wadiny/users",
    });
    updateData.image = { secure_url, public_id };
  }

  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    updateData,
    { new: true }
  ).select("-password -otpEmail -otpPassword -tempEmail");

  let decryptedPhone = null;
  if (user.phone) {
    decryptedPhone = await Decrypt({ key: user.phone, SECRET_KEY: process.env.SECRET_KEY });
  }

  return res.status(200).json({
    msg: "done",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: decryptedPhone,
      image: user.image,
      role: user.role,
    }
  });
});

// ==================== 9. Update Password ====================
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!(await Compare({ key: oldPassword, hashed: req.user.password }))) {
    return next(new Error("Invalid old password", { cause: 400 }));
  }

  const hash = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS });

  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { password: hash, changePasswordAt: Date.now() },
    { new: true }
  ).select("-password -otpEmail -otpPassword -tempEmail");

  return res.status(201).json({ msg: "done", user });
});

// ==================== 10. Share Profile ====================
export const shareProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id).select("name email image followers following");
  if (!user) return next(new Error("User not found", { cause: 404 }));
  return res.status(200).json({ msg: "done", user });
});

// ==================== 11. Get My Profile ====================
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("-password -otpEmail -otpPassword -tempEmail");
  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (user.phone) {
    user.phone = await Decrypt({ key: user.phone, SECRET_KEY: process.env.SECRET_KEY });
  }

  return res.status(200).json({ msg: "done", user });
});

// ==================== 12. Settings APIs ====================
export const getSettings = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("settings");

  const defaultSettings = {
    notifications: { push: true, email: true, offers: true, comments: true, likes: true },
    privacy: { showEmail: false, showPhone: false, showActivity: true },
  };

  return res.status(200).json({ settings: user?.settings || defaultSettings });
});

export const updateNotifications = asyncHandler(async (req, res, next) => {
  const { push, email, offers, comments, likes } = req.body;
  const currentSettings = req.user.settings || { notifications: {} };

  const updatedNotifications = {
    push: push !== undefined ? push : currentSettings.notifications?.push ?? true,
    email: email !== undefined ? email : currentSettings.notifications?.email ?? true,
    offers: offers !== undefined ? offers : currentSettings.notifications?.offers ?? true,
    comments: comments !== undefined ? comments : currentSettings.notifications?.comments ?? true,
    likes: likes !== undefined ? likes : currentSettings.notifications?.likes ?? true,
  };

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $set: { "settings.notifications": updatedNotifications } },
    { new: true }
  ).select("-password -otpEmail -otpPassword -tempEmail");

  return res.status(200).json({ msg: "Notifications settings updated", settings: user.settings });
});

export const updatePrivacy = asyncHandler(async (req, res, next) => {
  const { showEmail, showPhone, showActivity } = req.body;
  const currentSettings = req.user.settings || { privacy: {} };

  const updatedPrivacy = {
    showEmail: showEmail !== undefined ? showEmail : currentSettings.privacy?.showEmail ?? false,
    showPhone: showPhone !== undefined ? showPhone : currentSettings.privacy?.showPhone ?? false,
    showActivity: showActivity !== undefined ? showActivity : currentSettings.privacy?.showActivity ?? true,
  };

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $set: { "settings.privacy": updatedPrivacy } },
    { new: true }
  ).select("-password -otpEmail -otpPassword -tempEmail");

  return res.status(200).json({ msg: "Privacy settings updated", settings: user.settings });
});

// ==================== 13. Delete Account ====================
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!(await Compare({ key: password, hashed: req.user.password }))) {
    return next(new Error("Invalid password", { cause: 401 }));
  }

  if (req.user.image?.public_id) {
    await cloudinary.uploader.destroy(req.user.image.public_id).catch(() => {});
  }

  await userModel.findByIdAndDelete(req.user._id);

  return res.status(200).json({ msg: "Account deleted successfully", success: true });
});

// ==================== 14. Follow System ====================
export const followUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return next(new Error("You cannot follow yourself", { cause: 400 }));
  }

  const userToFollow = await userModel.findById(userId);
  if (!userToFollow) return next(new Error("User not found", { cause: 404 }));

  if (!req.user.following.includes(userId)) {
    req.user.following.push(userId);
    userToFollow.followers.push(req.user._id);
    await req.user.save();
    await userToFollow.save();
  }

  return res.status(200).json({ msg: "Followed successfully" });
});

export const unfollowUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  req.user.following = req.user.following.filter(id => id.toString() !== userId);
  await userModel.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
  await req.user.save();

  return res.status(200).json({ msg: "Unfollowed successfully" });
});

export const getFollowers = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id)
    .populate("followers", "name email image settings");

  const cleanedFollowers = user.followers.map(follower => {
    const privacy = follower.settings?.privacy || {};
    return {
      _id: follower._id,
      name: follower.name,
      image: follower.image,
      email: privacy.showEmail === true ? follower.email : null,
    };
  });

  return res.status(200).json({ followers: cleanedFollowers });
});

export const getFollowing = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id)
    .populate("following", "name email image settings");

  const cleanedFollowing = user.following.map(following => {
    const privacy = following.settings?.privacy || {};
    return {
      _id: following._id,
      name: following.name,
      image: following.image,
      email: privacy.showEmail === true ? following.email : null,
    };
  });

  return res.status(200).json({ following: cleanedFollowing });
});

export const checkFollowing = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const isFollowing = req.user.following.includes(userId);
  return res.status(200).json({ isFollowing });
});