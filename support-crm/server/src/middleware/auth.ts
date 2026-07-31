import { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";
import { verifyToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    if ((payload as unknown as { purpose?: string }).purpose === "mfa") {
      throw new Error("MFA token cannot be used as a session token");
    }
    // Deactivation must take effect immediately, not just block future logins —
    // a stateless JWT alone would let a deactivated user keep using an
    // already-issued token until it expires, so re-check status per request.
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.active) {
      return next(new ApiError(401, "This account has been deactivated"));
    }
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin") {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};
