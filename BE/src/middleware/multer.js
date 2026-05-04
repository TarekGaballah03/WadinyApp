// src/middleware/multer.js
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

export const fileTypes = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
  pdf: ["application/pdf"],
};

export const multerLocal = (customValidation = [], customPath = "generals") => {
  const fullPath = path.resolve(`./src/uploads`, customPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      cb(null, nanoid(4) + file.originalname);
    },
  });

  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};

export const multerHost = (customValidation = []) => {
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"), false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
};