// src/utils/encryption/decrypt.js
import CryptoJS from "crypto-js";

export const Decrypt = async ({ key, SECRET_KEY }) => {
  try {
    const bytes = CryptoJS.AES.decrypt(key, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};