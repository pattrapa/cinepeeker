import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

import multer from "multer";

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "recipes",
);

mkdirSync(uploadDirectory, {
  recursive: true,
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_request, file, callback) => {
    const extension =
      extensionByMimeType[file.mimetype] ||
      path.extname(file.originalname).toLowerCase();

    const filename = `${Date.now()}-${randomUUID()}${extension}`;

    callback(null, filename);
  },
});

export const uploadRecipeImage = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new Error(
          "Only JPG, PNG and WEBP images are allowed.",
        ),
      );

      return;
    }

    callback(null, true);
  },
});