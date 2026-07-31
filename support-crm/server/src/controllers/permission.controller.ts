import { NextFunction, Request, Response } from "express";
import { rolePermissionRepository } from "../repositories/rolePermission.repository";
import { ApiError } from "../middleware/errorHandler";
import { CONFIGURABLE_ROLES, PERMISSIONS } from "../types/permission";

export const permissionController = {
  async matrix(_req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await rolePermissionRepository.listAll();
      const grantedByRole = new Map<string, Set<string>>();
      for (const row of rows) {
        if (!grantedByRole.has(row.role)) grantedByRole.set(row.role, new Set());
        grantedByRole.get(row.role)!.add(row.permission);
      }
      res.json({
        permissions: PERMISSIONS,
        roles: CONFIGURABLE_ROLES.map((role) => ({
          role,
          granted: PERMISSIONS.filter((p) => grantedByRole.get(role)?.has(p) ?? false),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.params.role;
      if (!(CONFIGURABLE_ROLES as readonly string[]).includes(role)) {
        throw new ApiError(400, `"${role}" is not a configurable role`);
      }
      await rolePermissionRepository.setForRole(role, req.body.permissions);
      res.json({ role, granted: req.body.permissions });
    } catch (err) {
      next(err);
    }
  },

  async mine(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === "Admin") {
        return res.json({ role: "Admin", permissions: PERMISSIONS });
      }
      const rows = await rolePermissionRepository.listForRole(req.user!.role);
      res.json({ role: req.user!.role, permissions: rows.map((r) => r.permission) });
    } catch (err) {
      next(err);
    }
  },
};
