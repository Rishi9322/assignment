import crypto from "crypto";
import fs from "fs";
import path from "path";

export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
export const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024; // 15MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Server-generated name, unrelated to the client-supplied original filename,
// so it's safe to use directly as a path segment (no traversal, no collisions).
export const generateStoredFileName = (originalName: string) => {
  const ext = path.extname(originalName).slice(0, 20);
  return `${crypto.randomUUID()}${ext}`;
};

export const attachmentPath = (storedFileName: string) => path.join(UPLOAD_DIR, storedFileName);

export const deleteAttachmentFile = (storedFileName: string) => {
  const filePath = attachmentPath(storedFileName);
  fs.rm(filePath, { force: true }, () => {});
};
