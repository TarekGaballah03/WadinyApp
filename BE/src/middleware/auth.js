// src/middleware/auth.js
import { userModel } from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/globalErrorHandling/index.js";
import { verifyToken } from "../utils/token/verifyToken.js";

export const roles = {
  admin: "admin",
  user: "user",
   restaurant: "restaurant",  
};

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const decodedToken = async ({ authorization, tokenType, next }) => {
  const [prefix, token] = authorization?.split(" ") || [];

  if (!prefix || !token) {
    return next(new Error("Token not found", { cause: 404 }));
  }

  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;

  if (prefix == process.env.PREFIX_TOKEN_ADMIN) {
    ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_ADMIN;
    REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_ADMIN;
  } else if (prefix == process.env.PREFIX_TOKEN_USER) {
    ACCESS_SIGNATURE = process.env.ACCESS_SIGNATURE_USER;
    REFRESH_SIGNATURE = process.env.REFRESH_SIGNATURE_USER;
  } else {
    return next(new Error("Invalid token prefix", { cause: 401 }));
  }

  const decoded = await verifyToken({
    token,
    SIGNATURE: tokenType == tokenTypes.access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });

  if (!decoded?.id) {
    return next(new Error("Invalid token payload", { cause: 401 }));
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (parseInt(user.changePasswordAt?.getTime() / 1000) > decoded.iat) {
    return next(new Error("Token expired, please login again", { cause: 401 }));
  }

  if (user.isDeleted) {
    return next(new Error("User deleted", { cause: 401 }));
  }

  return user;
};

export const authentication = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({ authorization, tokenType: tokenTypes.access, next });
  req.user = user;
  next();
});

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Access denied", { cause: 403 }));
    }
    next();
  });
};