// src/middleware/auth.js
import { userModel, roles } from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/globalErrorHandling/index.js";
import { verifyToken } from "../utils/token/verifyToken.js";

export const tokenTypes = {
    access: "access",
    refresh: "refresh",
};

export const decodedToken = async ({ authorization, tokenType, next }) => {
    if (!authorization) return next(new Error("Token is required", { cause: 400 }));

    const [prefix, token] = authorization.split(" ");
    if (!token) return next(new Error("Token not found", { cause: 400 }));

    // Determine signature based on prefix
    let signature;
    
    switch(prefix) {
        case process.env.PREFIX_TOKEN_ADMIN:
            signature = tokenType === tokenTypes.access 
                ? process.env.ACCESS_SIGNATURE_ADMIN 
                : process.env.REFRESH_SIGNATURE_ADMIN;
            break;
        case process.env.PREFIX_TOKEN_USER:
            signature = tokenType === tokenTypes.access 
                ? process.env.ACCESS_SIGNATURE_USER 
                : process.env.REFRESH_SIGNATURE_USER;
            break;
        case process.env.PREFIX_TOKEN_REST:
            signature = tokenType === tokenTypes.access 
                ? process.env.ACCESS_SIGNATURE_REST 
                : process.env.REFRESH_SIGNATURE_REST;
            break;
        default:
            return next(new Error("Invalid token prefix", { cause: 401 }));
    }

const decoded = await verifyToken({ token, SIGNATURE: signature });
    if (!decoded?.id) return next(new Error("Invalid token payload", { cause: 401 }));

    const user = await userModel.findById(decoded.id);
    if (!user || user.isDeleted) return next(new Error("User not found", { cause: 404 }));

    // Check if password was changed after token was issued
    if (user.changePasswordAt) {
        const changePasswordTime = parseInt(user.changePasswordAt.getTime() / 1000);
        if (changePasswordTime > decoded.iat) {
            return next(new Error("Token expired, please login again", { cause: 401 }));
        }
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
            return next(new Error("Not authorized", { cause: 403 }));
        }
        next();
    });
};