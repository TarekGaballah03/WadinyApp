// src/utils/token/generalToken.js
import jwt from "jsonwebtoken";

export const generalToken = async ({ payload, SIGNATURE, option = {} }) => {
  return jwt.sign(payload, SIGNATURE, option);
};