// src/utils/token/verifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = async ({ token, SIGNATURE }) => {
  return jwt.verify(token, SIGNATURE);
};