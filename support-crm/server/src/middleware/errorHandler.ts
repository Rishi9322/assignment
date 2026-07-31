import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File exceeds the 15MB upload limit" : err.message;
    return res.status(400).json({ error: message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
