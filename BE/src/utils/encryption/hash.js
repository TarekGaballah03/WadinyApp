// src/utils/encryption/hash.js
import bcrypt from "bcryptjs";

export const Hash = async ({ key, SALT_ROUNDS }) => {
  return await bcrypt.hash(key, parseInt(SALT_ROUNDS));
};