// src/utils/encryption/compare.js
import bcrypt from "bcryptjs";

export const Compare = async ({ key, hashed }) => {
  return await bcrypt.compare(key, hashed);
};