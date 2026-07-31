import { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";
import { rolePermissionRepository } from "../repositories/rolePermission.repository";
import { Permission } from "../types/permission";

// Admin implicitly has every permission; other roles need an explicit grant
// in the RolePermission table, set via the admin permissions matrix.
export const requirePermission = (permission: Permission) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role === "Admin") return next();
    const role = req.user?.role;
    if (!role) return next(new ApiError(401, "Authentication required"));
    const granted = await rolePermissionRepository.hasPermission(role, permission);
    if (!granted) {
      return next(new ApiError(403, `Missing permission: ${permission}`));
    }
    next();
  };
};
